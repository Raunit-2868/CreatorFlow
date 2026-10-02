import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import { BrandProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import {
  Edit3,
  CheckCircle,
  ExternalLink,
  Globe,
  Building,
  ShieldCheck,
  Eye,
  Award,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BrandProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('51-200');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const userId = user?._id;
  const userName = user?.name;
  const userEmail = user?.email;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getBrandMe();
      setProfile(data);
      if (data) {
        setCompanyName(data.companyName || '');
        setLogo(data.logo || '');
        setDescription(data.description || '');
        setIndustry(data.industry || '');
        setWebsite(data.website || '');
        setLocation(data.location || '');
        setCompanySize(data.companySize || '51-200');
        setContactName(data.contactInformation?.contactName || '');
        setContactEmail(data.contactInformation?.contactEmail || '');
        setContactPhone(data.contactInformation?.contactPhone || '');
      } else {
        setCompanyName(userName || '');
        setContactEmail(userEmail || '');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, userName, userEmail]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEdit = () => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setLogo(profile.logo || '');
      setDescription(profile.description || '');
      setIndustry(profile.industry || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
      setCompanySize(profile.companySize || '51-200');
      setContactName(profile.contactInformation?.contactName || '');
      setContactEmail(profile.contactInformation?.contactEmail || '');
      setContactPhone(profile.contactInformation?.contactPhone || '');
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload: Partial<BrandProfile> = {
        companyName: companyName.trim(),
        logo: logo.trim(),
        description: description.trim(),
        industry: industry.trim(),
        website: website.trim(),
        location: location.trim(),
        companySize,
        contactInformation: {
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
        },
      };

      let updated: BrandProfile;
      if (profile) {
        updated = await profileService.updateBrandProfile(payload);
      } else {
        updated = await profileService.createBrandProfile(payload);
      }
      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Company profile saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading company profile..." />;
  }

  if (!profile && !isEditing) {
    return (
      <div className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}
        <EmptyState
          title="No Company Profile Setup Yet"
          description="Complete your company profile to post campaigns, discover top creators, and establish your brand presence."
          actionLabel="Set Up Company Profile"
          onAction={() => setIsEditing(true)}
        />
      </div>
    );
  }

  const completion = profile?.completionPercentage || 0;

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B8955A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B8955A]"></span>
            Verified Enterprise Entity
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight">
            Company Profile
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage your public brand identity, business credentials, and campaign reputation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?._id && (
            <Link to={`/brands/${profile._id}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                <span>Preview Public</span>
              </Button>
            </Link>
          )}
          <Button variant="primary" size="sm" onClick={handleOpenEdit} className="gap-2">
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Hero Banner & Identity Panel */}
      <div className="bg-[#FAF9F6] border border-[#DDD8CE] rounded-[12px] overflow-hidden shadow-sm">
        {/* Ambient Warm Ivory / Gold Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-[#F0E7D5] via-[#E8DFC9] to-[#DDD8CE] flex items-end justify-end p-4">
          <div className="bg-[#FAF9F6]/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-[#222222] text-xs font-semibold shadow-sm border border-[#DDD8CE]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B8955A]" />
            <span>Tier-1 Enterprise Brand</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 lg:p-8 -mt-12 relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Logo / Monogram */}
              <div className="w-24 h-24 rounded-[12px] bg-[#FAF9F6] border border-[#DDD8CE] shadow-md flex items-center justify-center p-2 shrink-0">
                {profile?.logo ? (
                  <img
                    src={profile.logo}
                    alt={profile.companyName}
                    className="w-full h-full object-contain rounded-[8px]"
                  />
                ) : (
                  <div className="w-full h-full rounded-[8px] bg-[#2B2B2B] text-white flex flex-col items-center justify-center font-headline text-2xl font-bold">
                    <span>{profile?.companyName?.slice(0, 2).toUpperCase() || 'CF'}</span>
                    <span className="text-[8px] uppercase tracking-widest text-[#B8955A]">Brand</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline text-2xl font-bold text-[#222222]">
                    {profile?.companyName}
                  </h2>
                  <Badge variant="warning" className="text-xs font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" /> Enterprise Shield
                  </Badge>
                </div>
                <p className="text-sm text-[#6B6B6B]">
                  {profile?.industry || 'Enterprise Brand'} {profile?.location && `• ${profile.location}`}
                </p>
              </div>
            </div>

            {/* Completion Meter */}
            <div className="w-full sm:w-64 bg-[#F5F2EB] p-4 rounded-[8px] border border-[#DDD8CE] space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                <span>Brand Verification</span>
                <span className="text-[#B8955A]">{completion}%</span>
              </div>
              <div className="w-full h-2 bg-[#FAF9F6] rounded-full overflow-hidden border border-[#DDD8CE]">
                <div
                  className="h-full bg-[#B8955A] transition-all duration-500 rounded-full"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                {completion === 100
                  ? 'Your company profile is fully verified.'
                  : 'Complete your profile to build trust with creators.'}
              </p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-[8px] bg-[#F5F2EB] border border-[#DDD8CE] flex items-start gap-3">
              <Globe className="w-5 h-5 text-[#B8955A] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider">
                  Digital Presence
                </p>
                {profile?.website ? (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[#222222] hover:text-[#B8955A] truncate block flex items-center gap-1"
                  >
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <p className="text-sm text-[#6B6B6B]">No website specified</p>
                )}
                <p className="text-xs text-[#6B6B6B]">Size: {profile?.companySize || '11-50'} team members</p>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F5F2EB] border border-[#DDD8CE] flex items-start gap-3">
              <Building className="w-5 h-5 text-[#B8955A] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider">
                  Headquarters
                </p>
                <p className="text-sm font-medium text-[#222222]">
                  {profile?.location || 'International Operations'}
                </p>
                <p className="text-xs text-[#6B6B6B]">GSTIN & KYC Registered Entity</p>
              </div>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F0E7D5]/40 border border-[#B8955A]/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B8955A] shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs uppercase font-semibold text-[#B8955A] tracking-wider">
                  Escrow Guarantee
                </p>
                <p className="text-sm font-medium text-[#222222]">Verified Escrow Signatory</p>
                <p className="text-xs text-[#6B6B6B]">100% Milestone-Secured Contracts</p>
              </div>
            </div>
          </div>

          {/* Description Narrative */}
          {profile?.description && (
            <div className="pt-2">
              <h3 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1.5">
                About the Brand
              </h3>
              <p className="text-sm text-[#222222] leading-relaxed max-w-4xl">
                {profile.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Industry Sector</span>
            <Building className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
            {profile?.industry || 'Enterprise'}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Verified industry category</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Company Size</span>
            <Users className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
            {profile?.companySize || '51-200'}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Full-time employees</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Reputation Status</span>
            <Award className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-xl font-bold font-headline text-[#4F765E]">
            A+ Verified
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Fast payment history</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Profile Completion</span>
            <ShieldCheck className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
            {completion}%
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Compliance & KYC rating</p>
        </Card>
      </div>

      {/* Primary Contact Details */}
      <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 rounded-[12px]">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-headline font-bold text-[#222222]">
            Primary Brand Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
            <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
              Contact Representative
            </p>
            <p className="font-medium text-[#222222]">
              {profile?.contactInformation?.contactName || 'Marketing Lead'}
            </p>
          </div>
          <div className="p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
            <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
              Partnership Inquiries
            </p>
            <p className="font-medium text-[#222222]">
              {profile?.contactInformation?.contactEmail || user?.email}
            </p>
          </div>
          <div className="p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
            <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
              Phone / Support
            </p>
            <p className="font-medium text-[#222222]">
              {profile?.contactInformation?.contactPhone || 'Available upon collaboration'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={profile ? 'Edit Company Profile' : 'Set Up Company Profile'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Company Name *
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nova Collective"
                required
              />
            </div>
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Logo URL
              </label>
              <Input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
              About the Brand / Narrative
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your brand values, target audience, and types of creators you love partnering with..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Industry
              </label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Apparel & Fashion"
              />
            </div>
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://novacollective.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Headquarters Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai & San Francisco"
              />
            </div>
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Company Size
              </label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full h-10 px-3 rounded-[8px] bg-[#FAF9F6] border border-[#DDD8CE] text-sm text-[#222222] focus:outline-none focus:border-[#B8955A]"
              >
                <option value="1-10">1 - 10 employees</option>
                <option value="11-50">11 - 50 employees</option>
                <option value="51-200">51 - 200 employees</option>
                <option value="201-500">201 - 500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[#DDD8CE] pt-3">
            <h4 className="font-headline font-bold text-sm text-[#222222] mb-3">
              Contact Representative Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1 block">
                  Name
                </label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Sarah Jenkins"
                />
              </div>
              <div>
                <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1 block">
                  Email
                </label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="partnerships@brand.com"
                />
              </div>
              <div>
                <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1 block">
                  Phone
                </label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1-555-0199"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#DDD8CE] pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
