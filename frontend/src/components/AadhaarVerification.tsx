import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface AadhaarVerificationProps {
  onVerified: (aadhaarNumber: string, phone: string) => void;
  onSkip?: () => void;
}

const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({ onVerified, onSkip }) => {
  const [step, setStep] = useState<'aadhaar' | 'otp' | 'verified'>('aadhaar');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 12);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setError('');
  };

  const handleSendOTP = async () => {
    const cleanedAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (cleanedAadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    // Simulate API call - accept any 6 digit OTP for demo
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep('verified');
    
    setTimeout(() => {
      onVerified(aadhaarNumber.replace(/\s/g, ''), phoneNumber);
    }, 1000);
  };

  if (step === 'verified') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Aadhaar Verified!</h3>
        <p className="text-muted-foreground text-sm">Your identity has been successfully verified</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Aadhaar Verification</h3>
          <p className="text-xs text-muted-foreground">Verify your identity using Aadhaar OTP</p>
        </div>
      </div>

      {step === 'aadhaar' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              value={aadhaarNumber}
              onChange={handleAadhaarChange}
              placeholder="XXXX XXXX XXXX"
              className="text-lg tracking-wider bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground">Enter your 12-digit Aadhaar number</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number (linked to Aadhaar)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile number"
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleSendOTP}
            variant="hero"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the 6-digit OTP sent to <span className="font-medium text-foreground">+91 {phoneNumber.slice(0, 2)}****{phoneNumber.slice(-2)}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <Button
            onClick={handleVerifyOTP}
            variant="hero"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <button
            onClick={() => setStep('aadhaar')}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            Change Aadhaar number
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        By verifying, you agree to our Terms of Service and Privacy Policy. 
        Your Aadhaar data is securely handled as per UIDAI guidelines.
      </p>
    </motion.div>
  );
};

export default AadhaarVerification;
