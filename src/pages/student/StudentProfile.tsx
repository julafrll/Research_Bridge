import { useState, useEffect, type FormEvent } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, CardHeader, CardTitle, Button, Input, Textarea, Badge } from '@/components/ui';
import { formatDate, initials } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function StudentProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setBio(profile.bio);
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await supabase
      .from('profiles')
      .update({ full_name: fullName, bio })
      .eq('id', user!.id);

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Profile</h1>
        <p className="mt-1 text-sm text-muted-500">Manage your personal information.</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-xl font-semibold text-navy-700">
              {initials(profile?.full_name || 'User')}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy-900">{profile?.full_name || 'Student'}</h2>
              <p className="text-sm text-muted-500">{user?.email}</p>
              <Badge variant="info" className="mt-1">Student</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Textarea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-success-600">
                  <CheckCircle2 className="h-4 w-4" /> Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-500">Email</span>
              <span className="text-navy-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-500">Member since</span>
              <span className="text-navy-900">{formatDate(profile?.created_at)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
