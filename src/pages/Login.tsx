import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { loginUser } from '../api/auth.service';
import { saveSessionUser } from '../utils/authSession';
import styles from './Register.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // New state for eye toggle
  const [showPassword, setShowPassword] = useState(false); 
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await loginUser({ email, password });
      toast.success(response.message);

      const role = response.data.role;
      const avatarUrl = response.data.avatarUrl ?? response.data.avatharUrl ?? '';

      saveSessionUser({
        id: response.data.id,
        role,
        userName: response.data.userName,
        avatarUrl,
        status: response.data.status,
      });

      if (response.data.status !== 'ACTIVE') {
        navigate('/account/pending');
      } else if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'INSTRUCTOR') navigate('/instructor');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="bottom-right" />
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        <div className={styles.inputGroup}>
          <input 
            type="email" 
            placeholder="Email *" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.passwordWrapper}>
            <input 
              // Toggle type between password and text
              type={showPassword ? "text" : "password"} 
              placeholder="Password *" 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <span 
              className={styles.eyeIcon} 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <button type="submit">Login</button>
        <p onClick={() => navigate('/register')} style={{cursor: 'pointer', marginTop: '10px'}}>
          Don't have an account? Register
        </p>
      </form>
    </div>
  );
};

export default Login;
