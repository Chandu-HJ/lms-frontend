import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { parseApiError } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types/auth.types';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT' as Role,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await signup(formData);
      setSuccess('Signup successful. Please login.');
      setTimeout(() => navigate('/auth/login'), 600);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(event) => setFormData((prev) => ({ ...prev, lastName: event.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <Select
          label="Role"
          value={formData.role}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              role: event.target.value as Role,
            }))
          }
          options={[
            { label: 'Student', value: 'STUDENT' },
            { label: 'Instructor', value: 'INSTRUCTOR' },
            { label: 'Admin', value: 'ADMIN' },
          ]}
        />
        {error ? <p className="field-error">{error}</p> : null}
        {success ? <p className="field-success">{success}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <p>
        Already registered? <Link to="/auth/login">Login</Link>
      </p>
    </div>
  );
};
