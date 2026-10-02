import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import { InfluencerProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MapPin,
  CheckCircle,
  Globe,
  Users,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowLeft,
  Mail,
  Bookmark,
  Share2,
} from 'lucide-react';

export const PublicInfluencerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'portfolio'>('overview');

  useEffect(() => {
    if (!id) return;
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileService.getInfluencerById(id);
        setProfile(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading creator media kit..." />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#222222]">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <EmptyState
          title="Creator Profile Not Found"
          description={error || 'This creator profile is either private or does not exist.'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={-1 as unknown as string}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B] hover:text-[#222222]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaved(!saved)}
              className={saved ? 'text-[#B8955A] border-[#B8955A]' : ''}
            >
              <Bookmark className="w-4 h-4 mr-1.5" />
              <span>{saved ? 'Saved' : 'Save Creator'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }}
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Profile Card Header */}
        <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 lg:p-8 rounded-[12px] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative shrink-0">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 lg:w-28 lg:h-28 rounded-[12px] object-cover border border-[#DDD8CE] shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-[12px] bg-[#2B2B2B] text-white flex items-center justify-center font-headline text-3xl font-bold border border-[#DDD8CE]">
                    {profile.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#B8955A] text-white rounded-full p-1 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline text-2xl lg:text-3xl font-bold text-[#222222]">
                    {profile.name}
                  </h1>
                  <Badge variant="warning" className="text-xs uppercase font-semibold">
                    Verified Creator
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B6B6B]">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#B8955A]" />
                      {profile.location}
                    </span>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-[#6B6B6B]" />
                      {profile.languages.join(', ')}
                    </span>
                  )}
                </div>

                {/* Niches */}
                {profile.niche && profile.niche.length > 0 && (
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

                <p className="text-sm text-[#222222] max-w-2xl pt-1 leading-relaxed">
                  {profile.bio || 'Professional digital creator and brand ambassador.'}
                </p>
              </div>
            </div>

            {/* Brand Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <Button variant="primary" className="gap-2">
                <Mail className="w-4 h-4" />
                <span>Invite to Campaign</span>
              </Button>
              <Button variant="outline" className="gap-2">
                <span>View Full Rate Card</span>
              </Button>
            </div>
          </div>

          {/* Social Platforms Row */}
          {profile.socialPlatforms && profile.socialPlatforms.length > 0 && (
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
              <span>Audience Reach</span>
              <Users className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
              {profile.totalFollowers ? profile.totalFollowers.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Cross-platform aggregate</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Avg Engagement</span>
              <TrendingUp className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
              {profile.avgEngagementRate ? `${profile.avgEngagementRate}%` : '0%'}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Verified audience interaction</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Services Listed</span>
              <Briefcase className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
              {profile.services ? profile.services.length : 0}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Packages ready for booking</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Portfolio Items</span>
              <Layers className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-headline text-[#222222]">
              {profile.portfolio ? profile.portfolio.length : 0}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Verified brand campaigns</p>
          </Card>
        </div>

        {/* Tab Controls */}
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
            Packages & Rates ({profile.services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'portfolio'
                ? 'border-[#B8955A] text-[#222222] font-semibold'
                : 'border-transparent text-[#6B6B6B] hover:text-[#222222]'
            }`}
          >
            Past Collaborations ({profile.portfolio?.length || 0})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-6 rounded-[12px]">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-headline font-bold text-[#222222]">
                  Audience Geography & Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">
                    Top Regions
                  </h4>
                  {profile.audienceDemographics?.topLocations &&
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
                      Primary followers situated in Tier-1 metros and international hubs.
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#DDD8CE]">
                  <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">
                    Audience Affinities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.audienceDemographics?.topInterests &&
                    profile.audienceDemographics.topInterests.length > 0
                      ? profile.audienceDemographics.topInterests
                      : ['Minimalist Living', 'Design Aesthetics', 'Sustainable Apparel', 'Tech']
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
                  Creator Guidelines & Turnaround
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4 text-sm">
                <div>
                  <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                    Languages
                  </h4>
                  <p className="text-[#222222]">
                    {profile.languages && profile.languages.length > 0
                      ? profile.languages.join(', ')
                      : 'English'}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DDD8CE]">
                  <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                    Standard Production Window
                  </h4>
                  <p className="text-[#222222]">
                    Draft submission within 3 to 7 business days from brief receipt.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DDD8CE]">
                  <h4 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">
                    CreatorFlow Protection
                  </h4>
                  <p className="text-[#222222]">
                    100% Escrow-backed contracts with milestone-based payout release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Services */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.services && profile.services.length > 0 ? (
              profile.services.map((svc, idx) => (
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
                    <Button variant="outline" size="sm">
                      Select Package
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-sm text-[#6B6B6B]">No packages configured yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.portfolio && profile.portfolio.length > 0 ? (
              profile.portfolio.map((item, idx) => (
                <Card
                  key={idx}
                  className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] overflow-hidden shadow-sm"
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
              ))
            ) : (
              <p className="text-sm text-[#6B6B6B]">No portfolio items showcase yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
