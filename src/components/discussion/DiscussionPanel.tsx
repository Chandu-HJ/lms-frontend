import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  getCourseDiscussion,
  postCourseDiscussion,
  toggleDiscussionBestAnswer,
  toggleDiscussionPin,
} from '../../api/discussion.service';
import { type DiscussionMessage } from '../../interfaces/discussion.types';
import { resolveImageSrc } from '../../utils/media';
import './DiscussionPanel.css';

interface DiscussionPanelProps {
  courseId: number;
  role: 'STUDENT' | 'INSTRUCTOR';
  mode?: 'WIDGET' | 'PAGE';
}

const WS_URL = 'http://localhost:8080/ws-lms';

const formatDate = (value: string): string =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const sortMessagesAscending = (messages: DiscussionMessage[]): DiscussionMessage[] =>
  [...messages]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((message) => ({
      ...message,
      replies: sortMessagesAscending(message.replies ?? []),
    }));

const getMentionToken = (value: string): string | null => {
  const parts = value.split(/\s+/);
  const token = parts[parts.length - 1];
  if (!token?.startsWith('@')) return null;
  return token.slice(1).toLowerCase();
};

const replaceMentionToken = (value: string, mentionName: string): string => {
  const parts = value.split(/\s+/);
  parts[parts.length - 1] = `@${mentionName}`;
  return `${parts.join(' ')} `;
};

const DiscussionPanel = ({ courseId, role, mode = 'WIDGET' }: DiscussionPanelProps) => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftMessage, setDraftMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [composeTarget, setComposeTarget] = useState<DiscussionMessage | null>(null);
  const [isOpen, setIsOpen] = useState(mode === 'PAGE');
  const clientRef = useRef<Client | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const loadDiscussion = async (showLoader = true) => {
    if (!courseId || Number.isNaN(courseId)) return;
    if (showLoader) setLoading(true);
    try {
      const data = await getCourseDiscussion(courseId, role);
      setThreads(data);
    } catch (error) {
      console.error('Unable to load discussion', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void loadDiscussion(true);
  }, [courseId, role]);

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(WS_URL, undefined, {
          withCredentials: true,
        } as any),
      reconnectDelay: 5000,
      debug: () => undefined,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/course/${courseId}/discussion`, () => {
        void loadDiscussion(false);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      const active = clientRef.current;
      clientRef.current = null;
      if (active) {
        void active.deactivate();
      }
    };
  }, [courseId, role]);

  const participantNames = useMemo(() => {
    const set = new Set<string>();
    const collect = (messages: DiscussionMessage[]) => {
      messages.forEach((message) => {
        const firstName = message.senderName?.split(' ')[0]?.trim();
        if (firstName) set.add(firstName);
        if (message.replies?.length) collect(message.replies);
      });
    };
    collect(threads);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [threads]);

  const sortedThreads = useMemo(() => sortMessagesAscending(threads), [threads]);

  useEffect(() => {
    if (loading) return;
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sortedThreads, loading, isOpen]);

  const messageMentionSuggestions = useMemo(() => {
    const token = getMentionToken(draftMessage);
    if (!token) return [];
    return participantNames
      .filter((name) => name.toLowerCase().startsWith(token))
      .slice(0, 6);
  }, [draftMessage, participantNames]);

  const postMessage = async (content: string, parentId?: number) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await postCourseDiscussion(courseId, role, trimmed, parentId);
      setDraftMessage('');
      setComposeTarget(null);
      await loadDiscussion(false);
    } catch (error) {
      console.error('Unable to post discussion message', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (messageId: number) => {
    if (role !== 'INSTRUCTOR') return;
    try {
      await toggleDiscussionPin(courseId, messageId);
      await loadDiscussion(false);
    } catch (error) {
      console.error('Unable to toggle pin', error);
    }
  };

  const handleToggleBestAnswer = async (messageId: number) => {
    if (role !== 'INSTRUCTOR') return;
    try {
      await toggleDiscussionBestAnswer(courseId, messageId);
      await loadDiscussion(false);
    } catch (error) {
      console.error('Unable to toggle best answer', error);
    }
  };

  const discussionPath =
    role === 'STUDENT'
      ? `/student/courses/${courseId}/discussion`
      : `/instructor/courses/${courseId}/discussion`;

  const renderMessageNode = (
    message: DiscussionMessage,
    depth = 0,
    parentMessage?: DiscussionMessage
  ) => (
    <div key={message.id} className="discussionNode" style={{ marginLeft: depth === 0 ? 0 : 16 }}>
      <article className={`discussionThread ${message.pinned ? 'isPinned' : ''} ${message.bestAnswer ? 'isBestAnswer' : ''}`}>
        <header className="discussionItemHeader">
          <img src={resolveImageSrc(message.senderAvatar)} alt={message.senderName} />
          <div>
            <strong>{message.senderName}</strong>
            <p>{formatDate(message.createdAt)}</p>
          </div>
          <div className="discussionBadges">
            {message.pinned ? <span className="pinBadge">Pinned</span> : null}
            {message.bestAnswer ? <span className="bestBadge">Best Answer</span> : null}
          </div>
        </header>
        {parentMessage ? (
          <div className="discussionReplyRef">
            <small>Replying to {parentMessage.senderName}</small>
            <p>{parentMessage.content}</p>
          </div>
        ) : null}
        <p className="discussionContent">{message.content}</p>
        <div className="discussionActions">
          <button
            type="button"
            onClick={() => {
              setComposeTarget(message);
              window.setTimeout(() => composerRef.current?.focus(), 0);
            }}
          >
            Reply
          </button>
          {role === 'INSTRUCTOR' && message.parentId == null ? (
            <button type="button" onClick={() => void handleTogglePin(message.id)}>
              {message.pinned ? 'Unpin' : 'Pin'}
            </button>
          ) : null}
          {role === 'INSTRUCTOR' && message.parentId != null ? (
            <button type="button" onClick={() => void handleToggleBestAnswer(message.id)}>
              {message.bestAnswer ? 'Unset Best Answer' : 'Mark Best Answer'}
            </button>
          ) : null}
        </div>

      </article>

      {message.replies?.length ? (
        <div className="discussionReplies">
          {message.replies.map((child) => renderMessageNode(child, depth + 1, message))}
        </div>
      ) : null}
    </div>
  );

  if (mode === 'WIDGET' && !isOpen) {
    return (
      <button type="button" className="discussionLauncher" onClick={() => setIsOpen(true)}>
        Open Discussion
      </button>
    );
  }

  return (
    <section className={mode === 'WIDGET' ? 'discussionWrap isWidget' : 'discussionWrap'}>
      <div className="discussionHeader">
        <h3>Course Discussion</h3>
        <div className="discussionHeaderActions">
          {mode === 'WIDGET' ? (
            <button type="button" onClick={() => navigate(discussionPath)}>
              See all
            </button>
          ) : null}
          {mode === 'WIDGET' ? (
            <button type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <p className="discussionEmpty">Loading discussions...</p> : null}
      {!loading && threads.length === 0 ? <p className="discussionEmpty">No messages yet.</p> : null}

      <div className="discussionThreads">
        {sortedThreads.map((thread) => renderMessageNode(thread))}
        <div ref={threadEndRef} />
      </div>

      <div className="discussionComposer">
        {composeTarget ? (
          <div className="discussionComposeMode">
            <span>Replying to {composeTarget.senderName}</span>
            <button type="button" onClick={() => setComposeTarget(null)}>
              Post Question
            </button>
          </div>
        ) : null}
        <textarea
          ref={composerRef}
          value={draftMessage}
          onChange={(event) => setDraftMessage(event.target.value)}
          placeholder={
            composeTarget
              ? `Reply to ${composeTarget.senderName}. Use @name to mention someone.`
              : 'Ask your question. Use @name to mention someone.'
          }
        />
        {messageMentionSuggestions.length > 0 && (
          <div className="discussionMentions">
            {messageMentionSuggestions.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => setDraftMessage((prev) => replaceMentionToken(prev, name))}
              >
                @{name}
              </button>
            ))}
          </div>
        )}
        <div className="discussionComposerActions">
          <button type="button" onClick={() => setComposeTarget(null)}>
            Post Question
          </button>
          <button
            type="button"
            onClick={() => void postMessage(draftMessage, composeTarget?.id)}
            disabled={submitting}
          >
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DiscussionPanel;
