"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  image?: string;
  buttonClassName?: string;
  buttonIcon?: string;
  isLoading?: boolean;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonClassName,
  buttonIcon,
  isLoading = false,
}: MeetingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 90 }}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative z-[100] flex w-full flex-col gap-6 border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white rounded-2xl shadow-2xl backdrop-blur-md",
          "max-w-[90vw] max-h-[85vh] overflow-y-auto",
          "sm:max-w-[540px] sm:px-8 sm:py-10",
          "scrollbar-hide", // Hide scrollbar but keep functionality
          "mt-24 sm:mt-12", // Increased top margin for better alignment with navbar
          className
        )}
      >
        <div className="flex flex-col gap-6">
          {image && (
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                  <Image src={image} alt="checked" width={72} height={72} />
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {title}
            </h2>
            {title && (
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-3"></div>
            )}
          </div>
          
          {children && (
            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
              {children}
            </div>
          )}
          
          {buttonText && (
            <Button
              className={cn(
                "relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 w-full sm:w-auto",
                isLoading && "opacity-75 cursor-not-allowed",
                buttonClassName
              )}
              onClick={handleClick}
              disabled={isLoading}
            >
            <div className="flex items-center justify-center gap-3">
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {buttonIcon && !isLoading && (
                <div className="relative">
                  <Image
                    src={buttonIcon}
                    alt="button icon"
                    width={16}
                    height={16}
                    className="relative z-10"
                  />
                </div>
              )}
              <span className="relative z-10">
                {buttonText || "Schedule Meeting"}
              </span>
            </div>
            
            {/* Button shine effect */}
            {!isLoading && (
              <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
            )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
