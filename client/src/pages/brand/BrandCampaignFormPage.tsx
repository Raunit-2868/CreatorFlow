import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { Campaign, CampaignStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  FileText,
  Users,
  Star,
  Package,
  DollarSign,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Send,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Select a category', value: '' },
  { label: 'Fashion & Lifestyle', value: 'Fashion & Lifestyle' },
  { label: 'Beauty & Skincare', value: 'Beauty & Skincare' },
  { label: 'Food & Beverage', value: 'Food & Beverage' },
  { label: 'Health & Wellness', value: 'Health & Wellness' },
  { label: 'Travel & Hospitality', value: 'Travel & Hospitality' },
  { label: 'Technology & Gadgets', value: 'Technology & Gadgets' },
  { label: 'Finance & Fintech', value: 'Finance & Fintech' },
  { label: 'Home & Interior Design', value: 'Home & Interior Design' },
  { label: 'Sports & Fitness', value: 'Sports & Fitness' },
  { label: 'Entertainment & Gaming', value: 'Entertainment & Gaming' },
  { label: 'Education & Career', value: 'Education & Career' },
  { label: 'Sustainability & Eco', value: 'Sustainability & Eco' },
  { label: 'Luxury & Premium', value: 'Luxury & Premium' },
  { label: 'Parenting & Family', value: 'Parenting & Family' },
];

const PLATFORMS = [
  { label: 'Any Platform', value: '' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'YouTube', value: 'YouTube' },
  { label: 'TikTok', value: 'TikTok' },
  { label: 'Twitter / X', value: 'Twitter' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Pinterest', value: 'Pinterest' },
  { label: 'Snapchat', value: 'Snapchat' },
  { label: 'Podcast', value: 'Podcast' },
];

const CONTENT_TYPES = [
  { label: 'Select content type', value: '' },
  { label: 'Reel / Short Video', value: 'Reel' },
  { label: 'Static Post / Photo', value: 'Static Post' },
  { label: 'Story', value: 'Story' },
  { label: 'YouTube Video', value: 'YouTube Video' },
  { label: 'Blog / Article', value: 'Blog' },
  { label: 'Podcast Mention', value: 'Podcast' },
  { label: 'Live Stream', value: 'Live Stream' },
  { label: 'Multi-format Bundle', value: 'Multi-format' },
];

// ─── step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Basics', icon: FileText },
  { id: 2, label: 'Audience', icon: Users },
  { id: 3, label: 'Creator Req.', icon: Star },
  { id: 4, label: 'Deliverables', icon: Package },
  { id: 5, label: 'Budget & Timeline', icon: DollarSign },
  { id: 6, label: 'Review', icon: Eye },
];

// ─── form state type ──────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  location: string;
  requiredPlatform: string;
  followerMin: string;
  followerMax: string;
  engagementRequirement: string;
  contentType: string;
  deliverables: string[];
  budget: string;
  currency: string;
  applicationDeadline: string;
  campaignDeadline: string;
}

const initialState = (campaign?: Campaign): FormState => ({
  title: campaign?.title || '',
  description: campaign?.description || '',
  category: campaign?.category || '',
  targetAudience: campaign?.targetAudience || '',
  location: campaign?.location || '',
  requiredPlatform: campaign?.requiredPlatform || '',
  followerMin: campaign?.followerRange?.min != null ? String(campaign.followerRange.min) : '',
  followerMax: campaign?.followerRange?.max != null ? String(campaign.followerRange.max) : '',
  engagementRequirement: campaign?.engagementRequirement != null ? String(campaign.engagementRequirement) : '',
  contentType: campaign?.contentType || '',
  deliverables: campaign?.deliverables || [],
  budget: campaign?.budget != null ? String(campaign.budget) : '',
  currency: campaign?.currency || 'USD',
  applicationDeadline: campaign?.applicationDeadline
    ? campaign.applicationDeadline.split('T')[0]
    : '',
  campaignDeadline: campaign?.campaignDeadline
    ? campaign.campaignDeadline.split('T')[0]
    : '',
});

// ─── component ────────────────────────────────────────────────────────────────

interface CampaignFormPageProps {
  existingCampaign?: Campaign;
  mode: 'create' | 'edit';
}

export const CampaignFormPage: React.FC<CampaignFormPageProps> = ({ existingCampaign, mode }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState(existingCampaign));
  const [deliverableInput, setDeliverableInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      set('deliverables', [...form.deliverables, deliverableInput.trim()]);
      setDeliverableInput('');
    }
  };

  const removeDeliverable = (idx: number) => {
    set('deliverables', form.deliverables.filter((_, i) => i !== idx));
  };

  const buildPayload = (status: CampaignStatus): Partial<Campaign> => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    targetAudience: form.targetAudience.trim(),
    location: form.location.trim(),
    requiredPlatform: form.requiredPlatform,
    followerRange: {
      min: form.followerMin ? parseInt(form.followerMin, 10) : 0,
      max: form.followerMax ? parseInt(form.followerMax, 10) : null,
    },
    engagementRequirement: form.engagementRequirement ? parseFloat(form.engagementRequirement) : 0,
    contentType: form.contentType,
    deliverables: form.deliverables,
    budget: parseFloat(form.budget) || 0,
    currency: form.currency,
    applicationDeadline: form.applicationDeadline || undefined,
    campaignDeadline: form.campaignDeadline || undefined,
    status,
  });

  const handleSave = async (status: CampaignStatus) => {
    if (!form.title.trim()) { setError('Campaign title is required.'); return; }
    if (!form.description.trim()) { setError('Campaign description is required.'); return; }
    if (!form.category) { setError('Please select a campaign category.'); return; }
    if (!form.budget || isNaN(parseFloat(form.budget))) { setError('Please enter a valid budget.'); return; }

    try {
      setSaving(true);
      setError(null);
      const payload = buildPayload(status);
      if (mode === 'edit' && existingCampaign?._id) {
        await campaignService.updateCampaign(existingCampaign._id, payload);
      } else {
        await campaignService.createCampaign(payload);
      }
      navigate('/brand/campaigns');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ── step validation ─────────────────────────────────────────────────────────
  const canProceedFromStep = (s: number): boolean => {
    if (s === 1) return form.title.trim().length > 0 && form.description.trim().length > 0 && form.category.length > 0;
    if (s === 5) return form.budget.trim().length > 0 && !isNaN(parseFloat(form.budget));
    return true;
  };

  // ── shared label style ──────────────────────────────────────────────────────
  const labelCls = 'block text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#B8955A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B8955A]" />
            {mode === 'create' ? 'New Campaign Brief' : 'Edit Campaign Brief'}
          </div>
          <h1 className="font-headline text-3xl font-bold text-[#222222] tracking-tight">
            {mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            {mode === 'create'
              ? 'Define your brand brief to attract the right creators.'
              : 'Update your campaign details.'}
          </p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => isDone && setStep(s.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-[#2B2B2B] text-white shadow-sm'
                    : isDone
                    ? 'bg-[#B8955A]/15 text-[#B8955A] border border-[#B8955A]/30 cursor-pointer hover:bg-[#B8955A]/25'
                    : 'bg-[#F5F2EB] text-[#6B6B6B] border border-[#DDD8CE] cursor-default'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#DDD8CE] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <Card className="bg-[#FAF9F6] border-[#DDD8CE] rounded-[12px] shadow-sm">
        <CardHeader className="p-6 pb-4 border-b border-[#DDD8CE]">
          <CardTitle className="text-base font-headline font-bold text-[#222222]">
            Step {step} — {STEPS[step - 1].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">

          {/* Step 1: Basics */}
          {step === 1 && (
            <>
              <div>
                <label className={labelCls}>Campaign Title *</label>
                <Input
                  id="campaign-title"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g., Summer Luxury Reels Campaign"
                  maxLength={200}
                />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <Select
                  id="campaign-category"
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  options={CATEGORIES}
                />
              </div>
              <div>
                <label className={labelCls}>Campaign Description *</label>
                <Textarea
                  id="campaign-description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe your campaign objectives, brand voice, key messaging, and expected creator style..."
                  rows={5}
                />
                <p className="text-xs text-[#6B6B6B] mt-1">{form.description.length}/5000 characters</p>
              </div>
            </>
          )}

          {/* Step 2: Target Audience */}
          {step === 2 && (
            <>
              <div>
                <label className={labelCls}>Target Audience Description</label>
                <Textarea
                  id="target-audience"
                  value={form.targetAudience}
                  onChange={e => set('targetAudience', e.target.value)}
                  placeholder="e.g., Women aged 22–35 interested in sustainable fashion and premium skincare..."
                  rows={4}
                />
              </div>
              <div>
                <label className={labelCls}>Target Location / Geography</label>
                <Input
                  id="campaign-location"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g., India — Mumbai, Delhi, Bangalore"
                />
              </div>
            </>
          )}

          {/* Step 3: Creator Requirements */}
          {step === 3 && (
            <>
              <div>
                <label className={labelCls}>Required Platform</label>
                <Select
                  id="required-platform"
                  value={form.requiredPlatform}
                  onChange={e => set('requiredPlatform', e.target.value)}
                  options={PLATFORMS}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Min. Followers</label>
                  <Input
                    id="follower-min"
                    type="number"
                    value={form.followerMin}
                    onChange={e => set('followerMin', e.target.value)}
                    placeholder="e.g., 10000"
                    min={0}
                  />
                </div>
                <div>
                  <label className={labelCls}>Max. Followers</label>
                  <Input
                    id="follower-max"
                    type="number"
                    value={form.followerMax}
                    onChange={e => set('followerMax', e.target.value)}
                    placeholder="e.g., 500000 (blank = no limit)"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Minimum Engagement Rate (%)</label>
                <Input
                  id="engagement-req"
                  type="number"
                  step={0.1}
                  value={form.engagementRequirement}
                  onChange={e => set('engagementRequirement', e.target.value)}
                  placeholder="e.g., 3.5"
                  min={0}
                />
              </div>
            </>
          )}

          {/* Step 4: Deliverables */}
          {step === 4 && (
            <>
              <div>
                <label className={labelCls}>Content Type</label>
                <Select
                  id="content-type"
                  value={form.contentType}
                  onChange={e => set('contentType', e.target.value)}
                  options={CONTENT_TYPES}
                />
              </div>
              <div>
                <label className={labelCls}>Add Deliverable</label>
                <div className="flex gap-2">
                  <Input
                    id="deliverable-input"
                    value={deliverableInput}
                    onChange={e => setDeliverableInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addDeliverable()}
                    placeholder="e.g., 3x Reels — 30 sec, product in frame"
                  />
                  <Button variant="outline" size="md" type="button" onClick={addDeliverable} className="shrink-0 gap-1">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
              {form.deliverables.length > 0 && (
                <div className="space-y-2">
                  <label className={labelCls}>Deliverables List</label>
                  {form.deliverables.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-[#F5F2EB] border border-[#DDD8CE] rounded-[8px]"
                    >
                      <span className="text-sm text-[#222222] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#B8955A]/20 text-[#B8955A] text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {d}
                      </span>
                      <button
                        onClick={() => removeDeliverable(i)}
                        className="text-[#6B6B6B] hover:text-[#C0392B] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 5: Budget & Timeline */}
          {step === 5 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Total Campaign Budget *</label>
                  <Input
                    id="campaign-budget"
                    type="number"
                    value={form.budget}
                    onChange={e => set('budget', e.target.value)}
                    placeholder="e.g., 50000"
                    min={0}
                  />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <Select
                    id="campaign-currency"
                    value={form.currency}
                    onChange={e => set('currency', e.target.value)}
                    options={[
                      { label: 'USD — US Dollar', value: 'USD' },
                      { label: 'INR — Indian Rupee', value: 'INR' },
                      { label: 'EUR — Euro', value: 'EUR' },
                      { label: 'GBP — British Pound', value: 'GBP' },
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Application Deadline</label>
                  <Input
                    id="application-deadline"
                    type="date"
                    value={form.applicationDeadline}
                    onChange={e => set('applicationDeadline', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Campaign End Date</label>
                  <Input
                    id="campaign-deadline"
                    type="date"
                    value={form.campaignDeadline}
                    onChange={e => set('campaignDeadline', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReviewField label="Title" value={form.title} />
                <ReviewField label="Category" value={form.category} />
                <ReviewField label="Budget" value={`${form.currency} ${Number(form.budget).toLocaleString()}`} />
                <ReviewField label="Platform" value={form.requiredPlatform || 'Any'} />
                <ReviewField
                  label="Follower Range"
                  value={form.followerMin || form.followerMax
                    ? `${form.followerMin ? Number(form.followerMin).toLocaleString() : '0'} – ${form.followerMax ? Number(form.followerMax).toLocaleString() : 'No limit'}`
                    : 'Not specified'}
                />
                <ReviewField label="Engagement Req." value={form.engagementRequirement ? `≥${form.engagementRequirement}%` : 'Not specified'} />
                <ReviewField label="Content Type" value={form.contentType || 'Not specified'} />
                <ReviewField label="Location" value={form.location || 'Global'} />
                <ReviewField label="Application Deadline" value={form.applicationDeadline || 'Open-ended'} />
                <ReviewField label="Campaign End Date" value={form.campaignDeadline || 'Not set'} />
              </div>

              <div className="p-4 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
                <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">Description</p>
                <p className="text-sm text-[#222222] leading-relaxed whitespace-pre-line">{form.description || '—'}</p>
              </div>

              {form.targetAudience && (
                <div className="p-4 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
                  <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">Target Audience</p>
                  <p className="text-sm text-[#222222] leading-relaxed">{form.targetAudience}</p>
                </div>
              )}

              {form.deliverables.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-2">Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {form.deliverables.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-[#B8955A]/15 text-[#B8955A] text-xs font-semibold border border-[#B8955A]/30">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/brand/campaigns')}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {step > 1 ? 'Back' : 'Cancel'}
        </Button>

        <div className="flex items-center gap-3">
          {step === 6 ? (
            <>
              <Button
                variant="outline"
                size="md"
                isLoading={saving}
                onClick={() => handleSave(existingCampaign?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT')}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={saving}
                onClick={() => handleSave('PUBLISHED')}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Publish Campaign
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceedFromStep(step)}
              className="gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Small review field component
const ReviewField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 bg-[#F5F2EB] rounded-[8px] border border-[#DDD8CE]">
    <p className="text-xs uppercase font-semibold text-[#6B6B6B] tracking-wider mb-1">{label}</p>
    <p className="text-sm font-medium text-[#222222] truncate">{value || '—'}</p>
  </div>
);

// ─── Wrapper pages (used by router) ──────────────────────────────────────────

export const BrandCreateCampaignPage: React.FC = () => (
  <CampaignFormPage mode="create" />
);

export const BrandEditCampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    campaignService.getCampaignById(id)
      .then(setCampaign)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-[#6B6B6B] p-6">Loading campaign...</div>;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (!campaign) return <Alert variant="error">Campaign not found.</Alert>;

  return <CampaignFormPage mode="edit" existingCampaign={campaign} />;
};
