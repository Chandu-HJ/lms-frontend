import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudentProfile, getStudentProfileCategories } from '../../api/student.service';
import './ProfileSetup.css';

const PROFILE_CACHE_KEY = 'student_profile_cache';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { bio?: string; interests?: string[] };
        setBio(parsed.bio ?? '');
        setInterests(parsed.interests ?? []);
      } catch {
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getStudentProfileCategories();
        setCategories(response.data.map((item) => item.categoryName));
      } catch (error) {
        console.error('Unable to fetch profile categories', error);
      }
    };

    fetchCategories();
  }, []);

  const toggleInterest = (category: string) => {
    setInterests((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const handleSkip = () => {
    navigate('/student/dashboard');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        bio: bio.trim() || undefined,
        interests: interests.length > 0 ? interests : undefined,
      };
      const response = await addStudentProfile(payload);
      sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ bio: payload.bio ?? '', interests: interests }));
      setMessage(response.message || 'Profile added successfully.');
      navigate('/student/dashboard');
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Unable to add profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="studentProfileWrap">
      <h2>Add Profile Info</h2>
      <p className="studentProfileSub">You can skip this now and update later.</p>

      <form className="studentProfileForm" onSubmit={handleSave}>
        <textarea
          className="studentInput"
          placeholder="Bio (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="interestBox">
          <h3>Interests</h3>
          <div className="interestGrid">
            {categories.map((category) => (
              <label key={category} className="interestItem">
                <input
                  type="checkbox"
                  checked={interests.includes(category)}
                  onChange={() => toggleInterest(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="studentProfileActions">
          <button type="button" className="ghostBtn" onClick={handleSkip}>
            Skip
          </button>
          <button type="submit" className="primaryBtn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {message && <div className="studentMessage">{message}</div>}
    </section>
  );
};

export default ProfileSetup;
