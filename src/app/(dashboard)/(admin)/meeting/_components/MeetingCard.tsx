"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import ParticipantDisplay from './ParticipantDisplay';

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  participants?: string[];
  description?: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  participants = [],
  description,
}: MeetingCardProps) => {
  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{date}</p>
            {description && (
              <p className="text-sm text-gray-400 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
      </article>
      <article className={cn("flex justify-between items-center relative", {})}>
        <div className="flex-1 max-sm:hidden">
          {participants.length > 0 ? (
            <ParticipantDisplay 
              participantIds={participants} 
              maxDisplay={4}
              size="md"
              showNames={false}
            />
          ) : (
            <div className="text-gray-400 text-sm">No participants</div>
          )}
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Link Copied");
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="feature"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
