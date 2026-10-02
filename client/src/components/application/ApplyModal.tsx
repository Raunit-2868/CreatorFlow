import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Campaign, Application } from '@/types';
import { applicationService } from '@/services/applicationService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ApplyModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [proposal, setProposal] = useState('');
  const [expectedCompensation, setExpectedCompensation] = useState<number | ''>(campaign.budget || '');
  const [contentApproach, setContentApproach] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);
  const [relevantPreviousWork, setRelevantPreviousWork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (portfolioLinks.length < 5) {
      setPortfolioLinks([...portfolioLinks, '']);
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proposal.trim() || proposal.trim().length < 10) {
      setErrorMessage('Please provide a proposal of at least 10 characters detailing why you are a great fit.');
      return;
    }

    if (expectedCompensation === '' || Number(expectedCompensation) < 0) {
      setErrorMessage('Please specify your expected compensation (must be a non-negative number).');
      return;
    }

    const filteredLinks = portfolioLinks
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      setIsSubmitting(true);
      const app = await applicationService.createApplication({
        campaignId: campaign._id!,
        proposal: proposal.trim(),
        expectedCompensation: Number(expectedCompensation),
        contentApproach: contentApproach.trim() || undefined,
        portfolioLinks: filteredLinks.length > 0 ? filteredLinks : undefined,
        relevantPreviousWork: relevantPreviousWork.trim() || undefined,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess(app);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#DDD8CE] rounded-[16px] p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DDD8CE]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#B8955A]">Campaign Application</span>
              <span className="text-[#6B6B6B]">•</span>
              <span className="text-xs text-[#6B6B6B]">{campaign.category}</span>
            </div>
            <h2 className="text-xl font-bold font-headline text-[#222222] mt-0.5">{campaign.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B6B6B] hover:text-[#222222] hover:bg-[#F5F2EB] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center">
            <div className="inline-flex p-3 bg-[#4F765E]/10 rounded-full text-[#4F765E] mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-headline text-[#222222]">Application Submitted!</h3>
            <p className="text-sm text-[#6B6B6B] mt-1 max-w-sm mx-auto">
              Your proposal and rate have been sent to the brand. You can track this application in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#A95C5C]/10 border border-[#A95C5C]/20 rounded-[8px] text-xs text-[#A95C5C]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campaign Quick Details Banner */}
            <div className="flex items-center justify-between p-3 bg-[#F5F2EB] border border-[#DDD8CE]/60 rounded-[8px] text-xs text-[#6B6B6B]">
              <div>
                <span className="font-semibold text-[#222222]">Campaign Budget:</span>{' '}
                ${campaign.budget.toLocaleString()} {campaign.currency || 'USD'}
              </div>
              <div>
                <span className="font-semibold text-[#222222]">Platform:</span>{' '}
                {campaign.requiredPlatform || 'Any Platform'}
              </div>
            </div>

            {/* Expected Compensation */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Expected Compensation ($ USD) <span className="text-[#A95C5C]">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="50"
                required
                value={expectedCompensation}
                onChange={(e) => setExpectedCompensation(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 1200"
                className="bg-[#FFFFFF] border-[#DDD8CE] text-[#222222] focus:border-[#B8955A] rounded-[8px] h-10"
              />
              <p className="text-[11px] text-[#6B6B6B] mt-1">Specify your proposed fee for all campaign deliverables.</p>
            </div>

            {/* Proposal Message */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Pitch & Proposal <span className="text-[#A95C5C]">*</span>
                </label>
                <span className="text-[11px] text-[#6B6B6B]">{proposal.length}/3000</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={3000}
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Introduce yourself, highlight why your audience aligns with this brand, and summarize your creative idea..."
                className="w-full bg-[#FFFFFF] border border-[#DDD8CE] text-[#222222] placeholder:text-[#6B6B6B] rounded-[8px] p-3 text-sm focus:outline-none focus:border-[#B8955A] focus:ring-1 focus:ring-[#B8955A] transition-all resize-y"
              />
            </div>

            {/* Content Approach */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Creative Content Approach (Optional)
              </label>
              <textarea
                rows={3}
                maxLength={3000}
                value={contentApproach}
                onChange={(e) => setContentApproach(e.target.value)}
                placeholder="e.g. A 60-second aesthetic reel with dynamic outfit transitions, voiceover narrating the collection story, and a dedicated story poll..."
                className="w-full bg-[#FFFFFF] border border-[#DDD8CE] text-[#222222] placeholder:text-[#6B6B6B] rounded-[8px] p-3 text-sm focus:outline-none focus:border-[#B8955A] focus:ring-1 focus:ring-[#B8955A] transition-all resize-y"
              />
            </div>

            {/* Portfolio Links */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Portfolio Links (Optional)
                </label>
                {portfolioLinks.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8955A] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Link
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {portfolioLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(idx, e.target.value)}
                      placeholder="https://instagram.com/p/... or https://tiktok.com/@..."
                      className="bg-[#FFFFFF] border-[#DDD8CE] text-[#222222] text-xs h-9 rounded-[8px]"
                    />
                    {portfolioLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="p-2 text-[#6B6B6B] hover:text-[#A95C5C] hover:bg-[#F5F2EB] rounded-[6px] transition-colors"
                        aria-label="Remove link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Relevant Previous Work */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-1.5">
                Relevant Previous Brand Collaborations (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={2000}
                value={relevantPreviousWork}
                onChange={(e) => setRelevantPreviousWork(e.target.value)}
                placeholder="Mention similar brands you've collaborated with and noteworthy engagement metrics..."
                className="w-full bg-[#FFFFFF] border border-[#DDD8CE] text-[#222222] placeholder:text-[#6B6B6B] rounded-[8px] p-3 text-sm focus:outline-none focus:border-[#B8955A] focus:ring-1 focus:ring-[#B8955A] transition-all resize-y"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD8CE]/60">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-[#FAF9F6] border-[#DDD8CE] text-[#222222] hover:bg-[#F5F2EB] rounded-[8px] h-10 px-4 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#2B2B2B] text-white hover:bg-[#3D3D3D] rounded-[8px] h-10 px-6 text-sm font-medium shadow-sm inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#B8955A]" /> Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
