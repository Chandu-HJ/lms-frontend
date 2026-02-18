import { useMemo, useState, type FormEvent } from 'react';
import type { CourseCategory } from '../../types/course.types';
import type { StudentProfileRequest } from '../../types/user.types';

interface StudentProfileFormProps {
  categories: CourseCategory[];
  initialBio?: string;
  initialInterests?: string[];
  submitting: boolean;
  submitLabel: string;
  onSubmit: (payload: StudentProfileRequest) => Promise<void>;
  onSkip?: () => void;
}

export const StudentProfileForm = ({
  categories,
  initialBio = '',
  initialInterests = [],
  submitting,
  submitLabel,
  onSubmit,
  onSkip,
}: StudentProfileFormProps) => {
  const [bio, setBio] = useState(initialBio);
  const [interests, setInterests] = useState<string[]>(initialInterests);

  const categoryNames = useMemo(() => categories.map((item) => item.categoryName), [categories]);

  const toggleInterest = (value: string): void => {
    setInterests((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await onSubmit({
      bio: bio.trim(),
      interests,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          placeholder="Tell us about your learning goals"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Interests</p>
        <div className="flex flex-wrap gap-2">
          {categoryNames.map((name) => {
            const selected = interests.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleInterest(name)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  selected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitLabel}
        </button>
        {onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Skip for now
          </button>
        ) : null}
      </div>
    </form>
  );
};
