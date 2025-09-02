"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface PreviousJob {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface TeamMember {
  _id: string;
  userId: string;
  slug: string;
  banner: string | null;
  publicIdBanner: string | null;
  skills: string[];
  previousJobs: PreviousJob[];
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  profileImage?: string | null;
  publicIdProfile?: string | null;
  designation: string;
}

interface DisplayTeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  userId: string;
}

const TestimonialSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<DisplayTeamMember[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchTeamMembers = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/teams?limit=100", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const teams: TeamMember[] = data.teams || [];

        const userPromises = teams.map((team: TeamMember) =>
          fetch(`/api/users/${team.userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(async (res) => {
              if (res.ok) {
                const userData = await res.json();
                return {
                  userId: team.userId,
                  firstName: userData.firstName || "Unknown",
                  lastName: userData.lastName || "",
                  email: userData.email || "N/A",
                  bio: userData.bio || "No bio available",
                  profileImage:
                    userData.avatar || "/images/testimonial/fallback-image.jpeg",
                  publicIdProfile: userData.publicIdProfile || null,
                };
              } else {
                return {
                  userId: team.userId,
                  firstName: "Unknown",
                  lastName: "",
                  email: "N/A",
                  bio: "No bio available",
                  profileImage: "/images/testimonial/fallback-image.jpeg",
                  publicIdProfile: null,
                };
              }
            })
            .catch(() => ({
              userId: team.userId,
              firstName: "Unknown",
              lastName: "",
              email: "N/A",
              bio: "No bio available",
              profileImage: "/images/testimonial/fallback-image.jpeg",
              publicIdProfile: null,
            }))
        );

        const users = await Promise.all(userPromises);

        const enrichedTeams = teams.map((team: TeamMember, i: number) => ({
          ...team,
          firstName: users[i].firstName,
          lastName: users[i].lastName,
          email: users[i].email,
          bio: users[i].bio,
          profileImage: users[i].profileImage,
          publicIdProfile: users[i].publicIdProfile,
        }));

        const displayMembers: DisplayTeamMember[] = enrichedTeams.map((member) => ({
          name: `${member.firstName} ${member.lastName || ""}`.trim() || "Unknown",
          role: member.designation
            ? member.designation.charAt(0).toUpperCase() +
              member.designation.slice(1).toLowerCase()
            : "Team Member",
          description: member.bio || "No description available",
          image: member.profileImage || "/images/testimonial/fallback-image.jpeg",
          userId: member.slug || member.userId,
        }));

        setTeamMembers(displayMembers);
      } else {
        const errorData = await response.json();
        toast.error(errorData?.error || "Failed to fetch testimonials");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch testimonials";
      toast.error(message);
      console.error("Fetch testimonials error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/images/testimonial/fallback-image.jpeg";
  };

  return (
    <section id="testimonial">
      <div className="px-4 sm:px-6 xl:container mx-auto">
        <div
          className="relative mx-auto mb-12 max-w-[620px] pt-6 text-center md:mb-20 lg:pt-16 animate-fade-in"
          data-wow-delay=".2s"
        >
          <span
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[40px] sm:text-[60px] lg:text-[95px] leading-[1] font-extrabold opacity-20 dark:opacity-80"
            style={{
              background:
                "linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              ...(typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? {
                    WebkitTextFillColor: "#f3f4f6",
                    color: "#f3f4f6",
                    background: "none",
                  }
                : {}),
            }}
          >
            LEADERSHIP
          </span>
          <h2 className="font-heading text-dark mb-5 text-3xl font-semibold sm:text-4xl md:text-[50px] md:leading-[60px] dark:text-gray-100">
            The brilliant minds powering innovation
          </h2>
          <p className="text-dark-text text-base leading-relaxed">
            Meet the visionaries who turned late-night coffee runs into
            groundbreaking code. This is where revolutionary ideas meet
            relentless execution.
          </p>
        </div>

        <div className="w-full px-4 sm:px-6">
          <div className="drop-shadow-light relative z-10 overflow-hidden rounded-sm bg-white px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-14 dark:drop-shadow-none dark:bg-gray-800">
            {isFetching ? (
              <div className="flex flex-col items-center gap-y-6 sm:gap-y-8 lg:flex-row lg:gap-x-8 lg:gap-y-0 min-h-[500px] sm:min-h-[550px] lg:min-h-[400px]">
                <div className="w-full lg:w-1/2 lg:text-left flex flex-col justify-center">
                  <div className="h-20 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-full max-w-[300px] sm:max-w-[360px] lg:w-1/2 lg:max-w-none flex items-center justify-center">
                  <div className="relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[360px] lg:h-[360px] bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                </div>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="relative">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={50}
                  slidesPerView={1}
                  pagination={{
                    clickable: true,
                    el: ".testimonial-pagination",
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="testimonial-swiper"
                >
                  {teamMembers.map((member, index) => (
                    <SwiperSlide key={member.userId}>
                      <div className="flex flex-col items-center gap-y-6 sm:gap-y-8 lg:flex-row lg:gap-x-8 lg:gap-y-0 min-h-[500px] sm:min-h-[550px] lg:min-h-[400px]">
                        <div className="w-full lg:w-1/2 lg:text-left flex flex-col justify-center">
                          <p
                            className="font-heading text-dark-text mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg xl:text-xl font-light italic line-clamp-6 sm:line-clamp-8 lg:line-clamp-6"
                            title={member.description}
                          >
                            “{member.description}”
                          </p>
                          <h3 className="font-heading text-dark text-lg sm:text-xl lg:text-2xl font-semibold dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-dark-text text-xs sm:text-sm lg:text-base">
                            {member.role}
                          </p>
                        </div>
                        <div className="w-full max-w-[300px] sm:max-w-[360px] lg:w-1/2 lg:max-w-none flex items-center justify-center">
                          <div className="relative w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[360px] lg:h-[360px] overflow-hidden">
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
                              <Image
                                src={member.image}
                                alt={`${member.name}'s testimonial image`}
                                width={360}
                                height={360}
                                className="object-cover w-[280px] h-[280px] sm:w-[330px] sm:h-[330px] lg:w-[360px] lg:h-[360px] rounded-sm"
                                priority={index === 0}
                                onError={handleImageError}
                              />
                              <div className="border-primary/10 bg-primary/5 dark:border-opacity-10 absolute -top-4 -right-4 -z-10 h-full w-full border backdrop-blur-[6px] dark:border-white/10 dark:bg-white/10"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {teamMembers.length > 1 && (
                  <div className="testimonial-pagination flex justify-center gap-2 mt-8"></div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                  No Testimonials Available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Check back soon to hear from our team!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .testimonial-swiper {
          width: 100%;
          padding-bottom: 40px;
        }

        .testimonial-pagination {
          position: relative;
          bottom: 0;
          z-index: 10;
        }

        .testimonial-bullet {
          display: inline-block;
          width: 12px;
          height: 12px;
          background: rgba(74, 108, 247, 0.3);
          border-radius: 50%;
          margin: 0 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .testimonial-bullet-active {
          background: #4a6cf7;
          transform: scale(1.2);
        }

        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .line-clamp-8 {
          display: -webkit-box;
          -webkit-line-clamp: 8;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 1024px) {
          .line-clamp-6 {
            -webkit-line-clamp: 8;
          }
        }

        @media (max-width: 640px) {
          .testimonial-bullet {
            width: 10px;
            height: 10px;
          }

          .line-clamp-6 {
            -webkit-line-clamp: 6;
          }

          .line-clamp-8 {
            -webkit-line-clamp: 6;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;
