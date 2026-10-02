import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import { InfluencerProfile, ISocialPlatform, IProfileService, IPortfolioItem } from '@/types';
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
  MapPin,
  CheckCircle,
  Plus,
  Trash2,
  Globe,
  Users,
  TrendingUp,
  Briefcase,
  Layers,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InfluencerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'portfolio'>('overview');

  // Form state
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNiches, setFormNiches] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [formSocials, setFormSocials] = useState<ISocialPlatform[]>([]);
  const [formServices, setFormServices] = useState<IProfileService[]>([]);
  const [formPortfolio, setFormPortfolio] = useState<IPortfolioItem[]>([]);

  const userId = user?._id;
  const userName = user?.name;
  const userAvatar = user?.avatar;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getInfluencerMe();
      setProfile(data);
      if (data) {
        setFormName(data.name || '');
        setFormAvatar(data.avatar || '');
        setFormBio(data.bio || '');
        setFormLocation(data.location || '');
        setFormNiches(data.niche ? data.niche.join(', ') : '');
        setFormLanguages(data.languages ? data.languages.join(', ') : '');
        setFormSocials(data.socialPlatforms || []);
        setFormServices(data.services || []);
        setFormPortfolio(data.portfolio || []);
      } else {
        // Preset with user info
        setFormName(userName || '');
        setFormAvatar(userAvatar || '');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId, userName, userAvatar]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEdit = () => {
    if (profile) {
      setFormName(profile.name || '');
      setFormAvatar(profile.avatar || '');
      setFormBio(profile.bio || '');
      setFormLocation(profile.location || '');
      setFormNiches(profile.niche ? profile.niche.join(', ') : '');
      setFormLanguages(profile.languages ? profile.languages.join(', ') : '');
      setFormSocials(profile.socialPlatforms ? [...profile.socialPlatforms] : []);
      setFormServices(profile.services ? [...profile.services] : []);
      setFormPortfolio(profile.portfolio ? [...profile.portfolio] : []);
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload: Partial<InfluencerProfile> = {
        name: formName.trim(),
        avatar: formAvatar.trim(),
        bio: formBio.trim(),
        location: formLocation.trim(),
        niche: formNiches
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean),
        languages: formLanguages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        socialPlatforms: formSocials,
        services: formServices,
        portfolio: formPortfolio,
      };

      let updated: InfluencerProfile;
      if (profile) {
        updated = await profileService.updateInfluencerProfile(payload);
      } else {
        updated = await profileService.createInfluencerProfile(payload);
      }
      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Profile saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Social form helpers
  const handleAddSocial = () => {
    setFormSocials([
      ...formSocials,
      { platform: 'Instagram', handle: '@', followerCount: 10000, engagementRate: 4.5 },
    ]);
  };

  const handleRemoveSocial = (index: number) => {
    setFormSocials(formSocials.filter((_, i) => i !== index));
  };

  // Service form helpers
  const handleAddService = () => {
    setFormServices([
      ...formServices,
      { name: 'Sponsored Reel', startingPrice: 1500, turnaroundDays: 5, description: '' },
    ]);
  };

  const handleRemoveService = (index: number) => {
    setFormServices(formServices.filter((_, i) => i !== index));
  };

  // Portfolio form helpers
  const handleAddPortfolio = () => {
    setFormPortfolio([
      ...formPortfolio,
      {
        title: 'Campaign Highlight',
        brandName: 'Brand Partner',
        mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
        description: 'Brand partnership visual storytelling',
      },
    ]);
  };

  const handleRemovePortfolio = (index: number) => {
    setFormPortfolio(formPortfolio.filter((_, i) => i !== index));
  };

  if (loading) {
    return <LoadingState message="Loading your creator profile..." />;
  }

  if (!profile && !isEditing) {
    return (
      <div className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}
        <EmptyState
          title="No Creator Profile Found"
          description="You haven't set up your public creator profile and media kit yet. Create your profile to start getting discovered by brands."
          actionLabel="Create Creator Profile"
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
            Creator Media Kit
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight">
            {profile?.name || user?.name}
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Manage your verified media kit, audience demographics, and creator rates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?._id && (
            <Link to={`/influencers/${profile._id}`} target="_blank">
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

      {/* Profile Header Hero Card */}
      <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 lg:p-8 rounded-[12px] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-[12px] object-cover border border-[#DDD8CE] shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-[12px] bg-[#2B2B2B] text-white flex items-center justify-center font-headline text-3xl font-bold border border-[#DDD8CE]">
                  {profile?.name?.slice(0, 2).toUpperCase() || 'CF'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-[#B8955A] text-white rounded-full p-1 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline text-2xl font-bold text-[#222222]">
                  {profile?.name}
                </h2>
                <Badge variant="warning" className="text-[11px] font-semibold tracking-wider uppercase">
                  Top Verified Creator
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B6B6B]">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#B8955A]" />
                    {profile.location}
                  </span>
                )}
                {profile?.languages && profile.languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-[#6B6B6B]" />
                    {profile.languages.join(', ')}
                  </span>
                )}
              </div>

              {/* Niches */}
              {profile?.niche && profile.niche.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.niche.map((n, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-[4px] bg-[#F5F2EB] border border-[#DDD8CE] text-xs font-medium text-[#222222]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              <p className="text-sm text-[#222222] max-w-2xl pt-1 leading-relaxed">
                {profile?.bio || 'No bio narrative added yet.'}
              </p>
            </div>
          </div>

          {/* Profile Completion Widget */}
          <div className="shrink-0 w-full lg:w-64 bg-[#F5F2EB] p-4 rounded-[8px] border border-[#DDD8CE] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Profile Strength</span>
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
                ? 'Your profile is 100% complete and fully verified.'
                : 'Complete all sections to rank higher in brand searches.'}
            </p>
          </div>
        </div>

        {/* Connected Channels Row */}
        {profile?.socialPlatforms && profile.socialPlatforms.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#DDD8CE] flex flex-wrap items-center gap-6 text-sm text-[#222222]">
            {profile.socialPlatforms.map((sp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-semibold capitalize text-[#2B2B2B]">{sp.platform}:</span>
                <span className="text-[#6B6B6B]">{sp.handle}</span>
                <span className="font-medium text-[#222222]">
                  {sp.followerCount ? sp.followerCount.toLocaleString() : 0} followers
                </span>
                {sp.engagementRate > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#F0E7D5] text-[#B8955A] font-semibold">
                    {sp.engagementRate}% ER
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Total Audience</span>
            <Users className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
            {profile?.totalFollowers ? profile.totalFollowers.toLocaleString() : '0'}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Cross-platform aggregate</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Avg Engagement</span>
            <TrendingUp className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
            {profile?.avgEngagementRate ? `${profile.avgEngagementRate}%` : '0%'}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Industry standard: 2.5%</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Active Services</span>
            <Briefcase className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
            {profile?.services ? profile.services.length : 0}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Packages ready for booking</p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            <span>Portfolio Works</span>
            <Layers className="w-4 h-4 text-[#B8955A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
            {profile?.portfolio ? profile.portfolio.length : 0}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">Brand collaborations featured</p>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#DDD8CE] flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#B8955A] text-[#222222] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#222222]'
          }`}
        >
          Overview & Demographics
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-[#B8955A] text-[#222222] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#222222]'
          }`}
        >
          Services & Rates ({profile?.services?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'portfolio'
              ? 'border-[#B8955A] text-[#222222] font-semibold'
              : 'border-transparent text-[#6B6B6B] hover:text-[#222222]'
          }`}
        >
          Portfolio Gallery ({profile?.portfolio?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 rounded-[12px]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-headline font-bold text-[#222222]">
                Audience Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">
                  Top Locations
                </h4>
                {profile?.audienceDemographics?.topLocations &&
                profile.audienceDemographics.topLocations.length > 0 ? (
                  <div className="space-y-2">
                    {profile.audienceDemographics.topLocations.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-[#222222]">{loc.location}</span>
                        <span className="font-semibold text-[#B8955A]">{loc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B]">
                    Primary demographic: Tier 1 Metros (Mumbai, Delhi, London, New York)
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#DDD8CE]">
                <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">
                  Audience Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.audienceDemographics?.topInterests &&
                  profile.audienceDemographics.topInterests.length > 0
                    ? profile.audienceDemographics.topInterests
                    : ['Minimalist Living', 'Sustainable Fashion', 'Modern Architecture', 'High Design']
                  ).map((interest, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#F5F2EB] text-xs text-[#222222] border border-[#DDD8CE]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 rounded-[12px]">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-headline font-bold text-[#222222]">
                Collaboration Terms & Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-sm">
              <div>
                <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                  Languages
                </h4>
                <p className="text-[#222222]">
                  {profile?.languages && profile.languages.length > 0
                    ? profile.languages.join(', ')
                    : 'English'}
                </p>
              </div>
              <div className="pt-2 border-t border-[#DDD8CE]">
                <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                  Standard Turnaround Time
                </h4>
                <p className="text-[#222222]">3 - 7 business days from brief sign-off</p>
              </div>
              <div className="pt-2 border-t border-[#DDD8CE]">
                <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                  Usage Rights
                </h4>
                <p className="text-[#222222]">
                  30-day organic and paid digital usage rights included by default.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Services & Rates */}
      {activeTab === 'services' && (
        <div>
          {profile?.services && profile.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.services.map((svc, idx) => (
                <Card
                  key={idx}
                  className="bg-[#FAF9F6] border-[#DDD8CE] p-5 rounded-[12px] flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-bold text-base text-[#222222]">
                        {svc.name}
                      </h3>
                      <span className="font-headline text-lg font-bold text-[#B8955A]">
                        ${svc.startingPrice?.toLocaleString()}
                      </span>
                    </div>
                    {svc.description && (
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">{svc.description}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#DDD8CE] flex items-center justify-between text-xs text-[#6B6B6B]">
                    <span>Turnaround: {svc.turnaroundDays || 3} days</span>
                    <Badge variant="default" className="text-[10px]">
                      Verified Rate
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Services Defined"
              description="Add your offerings such as dedicated reels, carousel posts, or story integrations to attract brands."
              actionLabel="Add Services"
              onAction={handleOpenEdit}
            />
          )}
        </div>
      )}

      {/* Tab 3: Portfolio Gallery */}
      {activeTab === 'portfolio' && (
        <div>
          {profile?.portfolio && profile.portfolio.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.portfolio.map((item, idx) => (
                <Card
                  key={idx}
                  className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] overflow-hidden shadow-sm hover:border-[#B8955A]/50 transition-colors"
                >
                  {item.mediaUrl && (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover bg-[#F5F2EB]"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    {item.brandName && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8955A]">
                        {item.brandName}
                      </span>
                    )}
                    <h3 className="font-headline font-semibold text-sm text-[#222222]">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-[#6B6B6B] line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Portfolio Works Added"
              description="Upload your high-performing brand campaigns and past content showcases."
              actionLabel="Add Portfolio Work"
              onAction={handleOpenEdit}
            />
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={profile ? 'Edit Creator Profile' : 'Create Creator Profile'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Display Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Elena Rostova"
                required
              />
            </div>
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Avatar Image URL
              </label>
              <Input
                value={formAvatar}
                onChange={(e) => setFormAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
              Bio / Creator Statement
            </label>
            <Textarea
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Tell brands about your aesthetic, niche, and audience..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Location (City / Country)
              </label>
              <Input
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="Mumbai & Berlin"
              />
            </div>
            <div>
              <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
                Languages (comma separated)
              </label>
              <Input
                value={formLanguages}
                onChange={(e) => setFormLanguages(e.target.value)}
                placeholder="English, Hindi, French"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-xs uppercase tracking-wider text-[#6B6B6B] mb-1.5 block">
              Niches / Categories (comma separated)
            </label>
            <Input
              value={formNiches}
              onChange={(e) => setFormNiches(e.target.value)}
              placeholder="Fashion & Lifestyle, Minimalist Aesthetics, Architecture"
            />
          </div>

          {/* Social Platforms Section */}
          <div className="border-t border-[#DDD8CE] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#222222]">
                Social Platforms & Reach
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSocial} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Platform
              </Button>
            </div>
            {formSocials.map((sp, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-[#F5F2EB] p-2.5 rounded-[8px]"
              >
                <Input
                  value={sp.platform}
                  placeholder="Platform"
                  onChange={(e) => {
                    const updated = [...formSocials];
                    updated[idx].platform = e.target.value;
                    setFormSocials(updated);
                  }}
                />
                <Input
                  value={sp.handle}
                  placeholder="@handle"
                  onChange={(e) => {
                    const updated = [...formSocials];
                    updated[idx].handle = e.target.value;
                    setFormSocials(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Followers"
                  value={sp.followerCount || ''}
                  onChange={(e) => {
                    const updated = [...formSocials];
                    updated[idx].followerCount = Number(e.target.value);
                    setFormSocials(updated);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="ER %"
                    value={sp.engagementRate || ''}
                    onChange={(e) => {
                      const updated = [...formSocials];
                      updated[idx].engagementRate = Number(e.target.value);
                      setFormSocials(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSocial(idx)}
                    className="text-[#A95C5C] hover:bg-[#A95C5C]/10 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Services Section */}
          <div className="border-t border-[#DDD8CE] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#222222]">
                Deliverable Packages & Rates
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Service
              </Button>
            </div>
            {formServices.map((svc, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-[#F5F2EB] p-2.5 rounded-[8px]"
              >
                <Input
                  value={svc.name}
                  placeholder="Service Name (e.g. Dedicated Reel)"
                  onChange={(e) => {
                    const updated = [...formServices];
                    updated[idx].name = e.target.value;
                    setFormServices(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Starting Price ($)"
                  value={svc.startingPrice || ''}
                  onChange={(e) => {
                    const updated = [...formServices];
                    updated[idx].startingPrice = Number(e.target.value);
                    setFormServices(updated);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Days turnaround"
                    value={svc.turnaroundDays || ''}
                    onChange={(e) => {
                      const updated = [...formServices];
                      updated[idx].turnaroundDays = Number(e.target.value);
                      setFormServices(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveService(idx)}
                    className="text-[#A95C5C] hover:bg-[#A95C5C]/10 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Section */}
          <div className="border-t border-[#DDD8CE] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-[#222222]">Portfolio Works</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddPortfolio} className="gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Work
              </Button>
            </div>
            {formPortfolio.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-[#F5F2EB] p-2.5 rounded-[8px]"
              >
                <Input
                  value={item.title}
                  placeholder="Title (e.g. Silk Campaign)"
                  onChange={(e) => {
                    const updated = [...formPortfolio];
                    updated[idx].title = e.target.value;
                    setFormPortfolio(updated);
                  }}
                />
                <Input
                  value={item.brandName || ''}
                  placeholder="Brand Partner"
                  onChange={(e) => {
                    const updated = [...formPortfolio];
                    updated[idx].brandName = e.target.value;
                    setFormPortfolio(updated);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={item.mediaUrl}
                    placeholder="Media URL"
                    onChange={(e) => {
                      const updated = [...formPortfolio];
                      updated[idx].mediaUrl = e.target.value;
                      setFormPortfolio(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePortfolio(idx)}
                    className="text-[#A95C5C] hover:bg-[#A95C5C]/10 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
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
