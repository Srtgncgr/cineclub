'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Settings, 
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface FormData {
  // Kişisel Bilgiler
  name: string;
  username: string;
  email: string;
  bio: string;
  
  // Hesap Ayarları
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  
  // Index signature for dynamic key access
  [key: string]: any;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    // Kişisel Bilgiler
    name: "",
    username: "",
    email: "",
    bio: "",
    
    // Hesap Ayarları
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setInitialLoading(true);
        
        const response = await fetch(`/api/users/${session.user.id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Kullanıcı bilgileri alınamadı');
        }

        const user = data.user;
        
        setFormData(prev => ({
          ...prev,
          name: user.displayName || user.username || '',
          username: user.username || '',
          email: session.user.email || '',
          bio: user.bio || ''
        }));



      } catch (err) {
        console.error('Kullanıcı bilgileri yükleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad alanı zorunludur';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı zorunludur';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Mevcut şifrenizi giriniz';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Yeni şifre en az 6 karakter olmalıdır';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        displayName: formData.name,
        username: formData.username,
        bio: formData.bio,
        // Şifre değişikliği varsa ekle
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      };

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Güncelleme başarısız');
      }

    setSaved(true);
    
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Success mesajını 3 saniye sonra gizle
    setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Güncelleme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Hesap silme başarısız');
      }

      // Başarılı silme sonrası logout ve ana sayfaya yönlendirme
      router.push('/');
      
    } catch (err) {
      console.error('Hesap silme hatası:', err);
      setError(err instanceof Error ? err.message : 'Hesap silinirken bir hata oluştu');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Kişisel Bilgiler', icon: User },
    { id: 'account', label: 'Hesap Ayarları', icon: Settings }
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Yeniden Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Profili Düzenle</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {error && (
                <div className="flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-right-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              {saved && (
                <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-right-1">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Kaydedildi!</span>
                </div>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Personal Information Form */}
            {activeSection === 'personal' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Adınızı ve soyadınızı giriniz"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kullanıcı Adı *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="kullaniciadi"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta Adresi *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="ornek@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hakkında
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Kendinizden bahsedin..."
                        maxLength={300}
                      />
                      <p className="mt-1 text-sm text-gray-500 text-right">
                        {formData.bio.length}/300
                      </p>
                    </div>

                  </div>
                </div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Hesap Ayarları</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Şifre Değiştir</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mevcut Şifre
                        </label>
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Mevcut şifrenizi giriniz"
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yeni Şifre
                          </label>
                          <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                              errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Yeni şifrenizi giriniz"
                          />
                          {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.newPassword}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Şifre Tekrarı
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Yeni şifrenizi tekrarlayınız"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4 text-red-600">Hesabı Sil</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
                    </p>
                    <Button 
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Siliniyor...' : 'Hesabımı Sil'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  <div>
                      <h3 className="font-semibold text-gray-900">Hesabı Sil</h3>
                      <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">
                    Hesabınızı silmek istediğinizden emin misiniz? Bu işlem sonrasında tüm verileriniz kalıcı olarak silinecek ve geri getirilemeyecektir.
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteLoading}
                    >
                      İptal
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Siliniyor...
                        </>
                      ) : (
                        'Evet, Sil'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 