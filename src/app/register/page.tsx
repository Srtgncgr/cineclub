'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  User,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Chrome,
  Github,
  Facebook,
  Film,
  ArrowLeft,
  Check,
  Shield,
  Info
} from 'lucide-react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  acceptTerms: boolean;
  receiveNewsletter: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    acceptTerms: false,
    receiveNewsletter: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Ad soyad en az 2 karakter olmalıdır';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Kullanım koşullarını kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({}); // Clear previous general errors
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.name
        }),
      });

      if (response.ok) {
        setRegisterSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Kayıt sırasında bir hata oluştu.' });
      }
      
    } catch (error) {
      console.error("Registration fetch error:", error);
      setErrors({ general: 'Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`${provider} ile kayıt olunuyor...`);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    const levels = [
      { text: 'Çok Zayıf', color: 'bg-red-500' },
      { text: 'Zayıf', color: 'bg-orange-500' },
      { text: 'Orta', color: 'bg-yellow-500' },
      { text: 'Güçlü', color: 'bg-blue-500' },
      { text: 'Çok Güçlü', color: 'bg-green-500' }
    ];
    
    return { strength, ...levels[Math.min(strength, 4)] };
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-600 mb-4">Giriş sayfasına yönlendiriliyorsunuz...</p>
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfa
        </Button>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-lg overflow-hidden">
          
          {/* Header Section */}
          <div className="p-8 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">CineClub'a Katıl!</h1>
            <p className="text-gray-600">Film dünyasında keşfetmeye başla</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            
            {/* Social Register Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-gray-200 hover:bg-gray-50"
                onClick={() => handleSocialRegister('Google')}
              >
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                Google ile Kayıt Ol
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="border-gray-200 hover:bg-gray-50"
                  onClick={() => handleSocialRegister('GitHub')}
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="border-gray-200 hover:bg-gray-50"
                  onClick={() => handleSocialRegister('Facebook')}
                >
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Facebook
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">veya e-posta ile</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">@</span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.username ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="kullaniciadi"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="ornek@email.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="En az 8 karakter"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{passwordStrength.text}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrarı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Şifrenizi tekrarlayın"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    className={`mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 ${
                      errors.acceptTerms ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="text-sm text-gray-700">
                    <Link href="/terms" className="text-primary hover:underline">Kullanım Koşulları</Link> ve{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Gizlilik Politikası</Link>'nı okudum ve kabul ediyorum.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.acceptTerms}
                  </p>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receiveNewsletter}
                    onChange={(e) => handleInputChange('receiveNewsletter', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    E-posta bildirimleri ve güncellemeler almak istiyorum (İsteğe bağlı)
                  </span>
                </label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Kayıt Oluşturuluyor...
                  </>
                ) : (
                  'Hesap Oluştur'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Zaten hesabın var mı?{' '}
                <Link 
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Giriş yap
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 