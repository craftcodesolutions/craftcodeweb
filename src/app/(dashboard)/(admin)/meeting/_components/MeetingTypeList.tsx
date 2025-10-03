'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import DatePickerComponent from './DatePickerComponent';
import TimeSelector from './TimeSelector';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import EnhancedUserSelect from './EnhancedUserSelect';

const initialValues = {
  dateTime: new Date().toISOString(),
  selectedTime: '',
  description: '',
  link: '',
  participants: [] as string[],
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useAuth();

  const resetForm = () => {
    setValues(initialValues);
    setCallDetail(undefined);
  };

  const handleModalClose = () => {
    setMeetingState(undefined);
    resetForm();
  };

  const createMeeting = async () => {
    if (!client || !user) return;
    
    try {
      if (!values.dateTime) {
        toast.error('Please select a date and time');
        return;
      }
      
      if (meetingState === 'isScheduleMeeting' && !values.selectedTime) {
        toast.error('Please select a meeting time');
        return;
      }
      
      // For scheduled meetings, combine date and time
      let finalDateTime = values.dateTime;
      if (meetingState === 'isScheduleMeeting' && values.selectedTime) {
        const selectedDate = new Date(values.dateTime);
        const [hours, minutes] = values.selectedTime.split(':');
        selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        finalDateTime = selectedDate.toISOString();
        
        // Validate future date for scheduled meetings
        if (selectedDate.getTime() <= Date.now()) {
          toast.error('Please select a future date and time');
          return;
        }
      }
      
      const meetingType = meetingState === 'isScheduleMeeting' ? 'scheduled' : 'instant';
      const title = values.description || (meetingType === 'scheduled' ? 'Scheduled Meeting' : 'Instant Meeting');
      
      // Create meeting via API
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: values.description,
          startsAt: finalDateTime,
          participants: values.participants,
          meetingType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }
      
      const { meeting } = await response.json();
      
      // Create a mock call object for compatibility with existing UI
      const mockCall = {
        id: meeting.id,
        state: {
          startsAt: meeting.startsAt,
          custom: {
            description: meeting.description,
            participants: meeting.participants,
            createdBy: meeting.createdBy,
            meetingType: meeting.meetingType,
          }
        }
      };
      
      setCallDetail(mockCall as unknown as Call);
      
      if (meetingState === 'isInstantMeeting') {
        router.push(`/meeting-area/${meeting.id}`);
        resetForm();
      }
      
      const participantCount = meeting.participants.length;
      toast.success(
        `Meeting created successfully${participantCount > 1 ? ` with ${participantCount} participants` : ''}!`
      );
      
    } catch (error) {
      console.error('Meeting creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
      toast.error(errorMessage);
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting-area/${callDetail?.id}`;
  
  // Get meeting details for display
  const getMeetingDetails = () => {
    if (!callDetail) return null;
    
    const customData = callDetail.state?.custom || {};
    return {
      participants: customData.participants || [],
      description: customData.description || '',
      meetingType: customData.meetingType || 'instant',
    };
  };
  
  const meetingDetails = getMeetingDetails();

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:shadow-blue-500/25 dark:hover:shadow-blue-600/25"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 hover:shadow-purple-500/25 dark:hover:shadow-purple-600/25"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />

      {/* Enhanced Schedule Meeting Modal */}
      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={handleModalClose}
          title="Schedule Your Meeting"
          handleClick={createMeeting}
          buttonText="Schedule Meeting"
          buttonClassName="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <div className="space-y-6">
            {/* Meeting Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-100/90">
                  Meeting Description
                </label>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Enter meeting description (optional)"
                  value={values.description}
                  onChange={(e) => setValues({ ...values, description: e.target.value })}
                  className="min-h-[100px] bg-slate-800/50 dark:bg-slate-700/50 border border-white/10 dark:border-white/20 rounded-xl px-4 py-3 text-white dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-300 focus:border-purple-400/50 dark:focus:border-purple-300/50 focus:ring-2 focus:ring-purple-400/20 dark:focus:ring-purple-300/20 transition-all duration-200 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-300">
                  {values.description.length}/500
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-100/90">
                  Meeting Date
                </label>
              </div>
              <div className="relative">
                <DatePickerComponent
                  selectedDate={values.dateTime}
                  onChange={(date) => setValues({ 
                    ...values, 
                    dateTime: date?.toISOString() || new Date().toISOString() 
                  })}
                  placeholder="Select meeting date"
                  required={true}
                  showTimeSelect={false}
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-100/90">
                  Meeting Time
                </label>
              </div>
              <div className="relative">
                <TimeSelector
                  selectedTime={values.selectedTime}
                  onChange={(time) => setValues({ ...values, selectedTime: time })}
                  placeholder="Select meeting time"
                  required={true}
                />
              </div>
            </div>

            {/* Participants Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-100/90">
                  Meeting Participants
                </label>
              </div>
              <div className="relative">
                <EnhancedUserSelect
                  selectedUsers={values.participants}
                  onUsersChange={(participants) => setValues({ ...values, participants })}
                  placeholder="Select meeting participants (optional)"
                  allowSearch={true}
                  multiple={true}
                  showSelectedCount={true}
                  size="md"
                  className=""
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-300">
                You will be automatically added as the meeting host. Selected participants will receive meeting invitations.
              </p>
            </div>

            {/* Meeting Preview */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/15 dark:to-blue-400/15 border border-purple-500/20 dark:border-purple-400/30 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white dark:text-gray-100 mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                Meeting Preview
              </h4>
              <div className="space-y-2 text-sm text-gray-300 dark:text-gray-200">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-purple-400">Scheduled Meeting</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-blue-400">
                    {new Date(values.dateTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="text-blue-400">
                    {values.selectedTime ? 
                      new Date(`2000-01-01T${values.selectedTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : 
                      'Not selected'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <span className="text-green-400">
                    {values.participants.length + 1} {/* +1 for the creator */}
                    {values.participants.length === 0 ? ' (You only)' : ` (Including you)`}
                  </span>
                </div>
                {values.description && (
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span className="text-gray-300 truncate max-w-32" title={values.description}>
                      {values.description.length > 20 ? `${values.description.substring(0, 20)}...` : values.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </MeetingModal>
      ) : (
        /* Enhanced Meeting Success Modal */
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={handleModalClose}
          title="Meeting Scheduled Successfully!"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success('Meeting link copied to clipboard!');
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
          buttonClassName="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="text-center space-y-2">
                <p className="text-green-300 text-sm">
                  Your meeting has been scheduled and is ready to share
                </p>
                {meetingDetails && meetingDetails.participants.length > 1 && (
                  <p className="text-green-400/80 text-xs">
                    {meetingDetails.participants.length} participant{meetingDetails.participants.length > 1 ? 's' : ''} will be notified
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Meeting Link
              </label>
              <div className="mt-2 p-3 bg-slate-700/50 rounded-lg border border-white/5">
                <p className="text-sm text-white/80 break-all font-mono">
                  {meetingLink}
                </p>
              </div>
            </div>
          </div>
        </MeetingModal>
      )}

      {/* Enhanced Join Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={handleModalClose}
        title="Join Meeting"
        buttonText="Join Meeting"
        buttonClassName="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        handleClick={() => {
          router.push(values.link);
          resetForm();
        }}
      >
        <div className="space-y-6">
          {/* Meeting Link Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <label className="text-sm font-medium text-white/90">
                Meeting Link or ID
              </label>
            </div>
            <div className="relative">
              <Input
                placeholder="Paste meeting link or enter meeting ID"
                value={values.link}
                onChange={(e) => setValues({ ...values, link: e.target.value })}
                className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setValues({ ...values, link: text });
                      toast.success('Link pasted from clipboard!');
                    } catch {
                      toast.error('Unable to read clipboard');
                    }
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Paste
                </button>
              </div>
            </div>
          </div>

          {/* Quick Join Options */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              Quick Join Tips
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Paste the full meeting URL or just the meeting ID</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Meeting IDs are usually 8-12 characters long</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>You can join meetings up to 15 minutes before start time</span>
              </div>
            </div>
          </div>
        </div>
      </MeetingModal>

      {/* Enhanced Instant Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={handleModalClose}
        title="Start Instant Meeting"
        buttonText="Start Meeting Now"
        buttonClassName="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        handleClick={createMeeting}
      >
        <div className="space-y-6">
          {/* Instant Meeting Info */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-white/90 text-sm">
                Ready to start your meeting instantly?
              </p>
              <p className="text-gray-400 text-xs">
                Your meeting will begin immediately and others can join using the meeting link
              </p>
            </div>
          </div>

          {/* Meeting Features */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Instant Meeting Features
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>HD Video & Audio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Screen Sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Chat Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Recording Available</span>
              </div>
            </div>
          </div>

          {/* Quick Start Note */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-white/90 font-medium">Quick Start</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click &quot;Start Meeting Now&quot; to create and join your meeting immediately. 
                  You&apos;ll be redirected to the meeting room where you can invite others.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
