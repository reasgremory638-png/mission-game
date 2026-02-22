import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody } from '../components/Card';
import { Modal } from '../components/Modal';
import './Auth.css';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOTP] = useState('');

  const login = useAppStore((s) => s.login);
  const requestOTP = useAppStore((s) => s.requestOTP);
  const verifyOTP = useAppStore((s) => s.verifyOTP);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      setIsLoading(true);
      const generatedOTP = await requestOTP(email);
      setShowOTPModal(true);
      // In production, OTP would be sent via email
      console.log('OTP Code:', generatedOTP);
    } catch (error) {
      setErrors({ email: 'User not found or error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    try {
      setIsLoading(true);
      await verifyOTP(email, otp);

      // Now attempt login
      const success = await login(email, password);
      if (success) {
        setShowOTPModal(false);
        onSuccess();
      } else {
        setErrors({ password: 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ otp: error instanceof Error ? error.message : 'Invalid OTP' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // First request OTP
    await handleRequestOTP();
  };

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <Card className="auth-card">
        <CardBody>
          <div className="auth-header">
            <h1>🏝️ Mission Visual</h1>
            <p>Build better habits, one day at a time</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              icon="✉️"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              icon="🔒"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Requesting OTP...' : 'Login & Verify'}
            </Button>
          </form>

          <div className="auth-divider">
            Don't have an account?
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="auth-switch"
            >
              Register here
            </button>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        title="Verify Your Email"
        size="sm"
      >
        <div className="otp-form">
          <p className="otp-description">
            Please check your email for the verification code
          </p>
          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOTP(e.target.value);
              setErrors({ ...errors, otp: '' });
            }}
            error={errors.otp}
            maxLength={6}
          />
          <Button
            onClick={handleVerifyOTP}
            variant="success"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
