import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService } from '@/services/profileService';
import { BrandProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CheckCircle,
  Globe,
  Building,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Share2,
  ExternalLink,
  Users,
  Award,
} from 'lucide-react';

export const PublicBrandProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBrandProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileService.getBrandById(id);
        setProfile(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandProfile();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading company profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#222222]">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <EmptyState
          title="Company Profile Not Found"
          description={error || 'This brand profile does not exist or is inactive.'}
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
            <span>Back</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Company profile link copied to clipboard!');
            }}
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span>Share Dossier</span>
          </Button>
        </div>

        {/* Hero Banner & Identity Panel */}
        <div className="bg-[#FAF9F6] border border-[#DDD8CE] rounded-[12px] overflow-hidden shadow-sm">
          {/* Ambient Banner */}
          <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-[#F0E7D5] via-[#E8DFC9] to-[#DDD8CE] flex items-end justify-end p-4">
            <div className="bg-[#FAF9F6]/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-[#222222] text-xs font-semibold shadow-sm border border-[#DDD8CE]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B8955A]" />
              <span>Tier-1 Flagship Brand</span>
            </div>
          </div>

          {/* Profile Core */}
          <div className="p-6 lg:p-8 -mt-12 relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="w-24 h-24 rounded-[12px] bg-[#FAF9F6] border border-[#DDD8CE] shadow-md flex items-center justify-center p-2 shrink-0">
                  {profile.logo ? (
                    <img
                      src={profile.logo}
                      alt={profile.companyName}
                      className="w-full h-full object-contain rounded-[8px]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[8px] bg-[#2B2B2B] text-white flex flex-col items-center justify-center font-headline text-2xl font-bold">
                      <span>{profile.companyName.slice(0, 2).toUpperCase()}</span>
                      <span className="text-[8px] uppercase tracking-widest text-[#B8955A]">Brand</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-headline text-2xl lg:text-3xl font-bold text-[#222222]">
                      {profile.companyName}
                    </h1>
                    <Badge variant="warning" className="text-xs font-semibold">
                      <CheckCircle className="w-3 h-3 mr-1" /> Enterprise Shield
                    </Badge>
                  </div>
                  <p className="text-sm text-[#6B6B6B]">
                    {profile.industry || 'Brand Partner'} {profile.location && `• ${profile.location}`}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {profile.contactInformation?.contactEmail ? (
                  <a href={`mailto:${profile.contactInformation.contactEmail}`}>
                    <Button variant="primary" className="gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Contact Brand</span>
                    </Button>
                  </a>
                ) : (
                  <Button variant="primary" className="gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Apply to Active Campaigns</span>
                  </Button>
                )}
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
                  {profile.website ? (
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
                    <p className="text-sm text-[#6B6B6B]">Verified Online Business</p>
                  )}
                  <p className="text-xs text-[#6B6B6B]">Company size: {profile.companySize || '51-200'} employees</p>
                </div>
              </div>

              <div className="p-4 rounded-[8px] bg-[#F5F2EB] border border-[#DDD8CE] flex items-start gap-3">
                <Building className="w-5 h-5 text-[#B8955A] shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider">
                    Headquarters
                  </p>
                  <p className="text-sm font-medium text-[#222222]">
                    {profile.location || 'Global Headquarters'}
                  </p>
                  <p className="text-xs text-[#6B6B6B]">Corporate Registry Verified</p>
                </div>
              </div>

              <div className="p-4 rounded-[8px] bg-[#F0E7D5]/40 border border-[#B8955A]/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#B8955A] shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs uppercase font-semibold text-[#B8955A] tracking-wider">
                    Escrow Protected
                  </p>
                  <p className="text-sm font-medium text-[#222222]">Guaranteed Escrow Payouts</p>
                  <p className="text-xs text-[#6B6B6B]">All collaborations backed by escrow</p>
                </div>
              </div>
            </div>

            {/* Description Narrative */}
            {profile.description && (
              <div className="pt-2">
                <h3 className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1.5">
                  About the Company
                </h3>
                <p className="text-sm text-[#222222] leading-relaxed max-w-4xl">
                  {profile.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reputation Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Industry</span>
              <Building className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
              {profile.industry || 'Enterprise'}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Verified industry focus</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Team Size</span>
              <Users className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
              {profile.companySize || '51-200'}
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Full-time staff members</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Payment Escrow</span>
              <ShieldCheck className="w-4 h-4 text-[#4F765E]" />
            </div>
            <div className="mt-2 text-xl font-bold font-headline text-[#4F765E]">
              100% Escrow
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Funds locked before work starts</p>
          </Card>

          <Card className="bg-[#FAF9F6] border-[#DDD8CE] p-4 rounded-[12px]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              <span>Creator Trust</span>
              <Award className="w-4 h-4 text-[#B8955A]" />
            </div>
            <div className="mt-2 text-xl font-bold font-headline text-[#222222]">
              Verified Partner
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1">Direct creator communications</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
