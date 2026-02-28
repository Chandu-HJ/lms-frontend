import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api/auth.service';
import { type RegisterRequest, type UserRole } from '../interfaces/auth.types';
import { saveSessionUser } from '../utils/authSession';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'STUDENT', // [cite: 6]
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Exact Regex from your Backend 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";
    
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, number and special character";
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await registerUser(formData);
      if (formData.role === 'STUDENT') {
        const loginResponse = await loginUser({ email: formData.email, password: formData.password });
        const avatarUrl = loginResponse.data.avatarUrl ?? loginResponse.data.avatharUrl ?? '';
        saveSessionUser({
          id: loginResponse.data.id,
          role: loginResponse.data.role,
          userName: loginResponse.data.userName,
          avatarUrl,
          status: loginResponse.data.status,
        });
        toast.success('Registration successful!');
        if (loginResponse.data.status === 'ACTIVE') {
          navigate('/student/profile/setup');
        } else {
          navigate('/account/pending');
        }
      } else {
        toast.success('Registration successful! Please login.');
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "Registration failed";
      toast.error(serverMessage); // Toast for backend errors
    }
  };

  return (
    <div className={styles.container}>
      {/* Toast moved to bottom-right as requested */}
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <div className={styles.inputGroup}>
          <input type="text" placeholder="First Name *" 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
          {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <input type="text" placeholder="Last Name *" 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
        </div>

        <div className={styles.inputGroup}>
          <input type="email" placeholder="Email *" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.inputGroup}>
          <input type="password" placeholder="Password *" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={styles.inputGroup}>
          <input type="password" placeholder="Re-enter Password *" 
            onChange={(e) => setConfirmPassword(e.target.value)} />
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label>Join as:</label>
          <select onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        <button type="submit">Register</button>
        <p className={styles.loginHint}>
          Already registered?{' '}
          <button type="button" className={styles.loginLinkBtn} onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
