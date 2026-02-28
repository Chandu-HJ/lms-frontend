import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStudentProfile,
  getStudentProfileCategories,
  getStudentProfileInterests,
  putStudentProfile,
} from '../../api/student.service';
import './ProfileSetup.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [initialData, setInitialData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    bio: string;
    interests: string[];
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');

      try {
        const [profileResponse, interestsResponse, categoriesResponse] = await Promise.all([
          getStudentProfile(),
          getStudentProfileInterests(),
          getStudentProfileCategories(),
        ]);

        setFirstName(profileResponse.firstName ?? '');
        setLastName(profileResponse.lastName ?? '');
        setEmail(profileResponse.email ?? '');
        setAvatarUrl(profileResponse.avatarUrl ?? '');
        setBio(profileResponse.bio ?? '');

        const currentInterests =
          interestsResponse.data.length > 0
            ? interestsResponse.data.map((item) => item.categoryName)
            : (profileResponse.interestNames ?? []);
        const resolvedInterests = Array.from(new Set(currentInterests));
        setInterests(resolvedInterests);
        setInitialData({
          firstName: profileResponse.firstName ?? '',
          lastName: profileResponse.lastName ?? '',
          email: profileResponse.email ?? '',
          avatarUrl: profileResponse.avatarUrl ?? '',
          bio: profileResponse.bio ?? '',
          interests: resolvedInterests,
        });

        setCategories(categoriesResponse.data.map((item) => item.categoryName));
      } catch (fetchError: unknown) {
        console.error('Unable to fetch student profile', fetchError);
        setError('Unable to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProfileData();
  }, []);

  const toggleInterest = (category: string) => {
    if (!isEditing) return;
    setInterests((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category],
    );
  };

  const handleCancelEdit = () => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setAvatarUrl(initialData.avatarUrl);
      setBio(initialData.bio);
      setInterests(initialData.interests);
    }
    setError('');
    setMessage('');
    setIsEditing(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEditing) {
      setError('');
      setMessage('');
      setIsEditing(true);
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      setError('First name and last name are required.');
      return;
    }

    setError('');
    setMessage('');
    setSaving(true);

    try {
      const payload = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        avatarUrl,
        bio: bio.trim(),
        email,
        interestNames: interests,
      };
      const response = await putStudentProfile(payload);
      setFirstName(response.firstName ?? trimmedFirstName);
      setLastName(response.lastName ?? trimmedLastName);
      setEmail(response.email ?? email);
      setAvatarUrl(response.avatarUrl ?? avatarUrl);
      setBio(response.bio ?? bio);
      const updatedInterests = response.interestNames ?? interests;
      setInterests(updatedInterests);
      setInitialData({
        firstName: response.firstName ?? trimmedFirstName,
        lastName: response.lastName ?? trimmedLastName,
        email: response.email ?? email,
        avatarUrl: response.avatarUrl ?? avatarUrl,
        bio: response.bio ?? bio,
        interests: updatedInterests,
      });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (saveError: unknown) {
      const errorMessage =
        typeof saveError === 'object' &&
        saveError !== null &&
        'response' in saveError &&
        typeof (saveError as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (saveError as { response?: { data?: { message?: string } } }).response?.data?.message ?? ''
          : 'Unable to update profile.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="studentProfileWrap"><div className="studentMessage">Loading profile...</div></section>;
  }

  const resolvedAvatar =
    avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`.trim() || 'Student')}`;

  return (
    <section className="studentProfileWrap">
      <div className="studentProfileAvatarWrap">
        <img src={resolvedAvatar} alt={`${firstName} ${lastName}`.trim() || 'Student avatar'} className="studentProfileAvatar" />
      </div>
      <h2>Profile</h2>
      <p className="studentProfileSub">
        {isEditing ? 'Update first name, last name, bio and interests.' : 'View your profile details.'}
      </p>

      <form className="studentProfileForm" onSubmit={handleSave}>
        <div className="profileNameGrid">
          <input
            type="text"
            className="studentTextInput"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!isEditing}
          />
          <input
            type="text"
            className="studentTextInput"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <input type="email" className="studentTextInput" value={email} disabled readOnly />

        <textarea
          className="studentInput"
          placeholder="Bio (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!isEditing}
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
                  disabled={!isEditing}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="studentProfileActions">
          <button
            type="button"
            className="ghostBtn"
            onClick={isEditing ? handleCancelEdit : () => navigate('/student/dashboard')}
          >
            {isEditing ? 'Cancel Edit' : 'Back'}
          </button>
          <button type="submit" className="primaryBtn" disabled={saving}>
            {!isEditing ? 'Edit Profile' : saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>

      {error && <div className="studentMessage">{error}</div>}
      {message && <div className="studentMessage">{message}</div>}
    </section>
  );
};

export default ProfileEdit;
