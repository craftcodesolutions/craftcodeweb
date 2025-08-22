import { useState, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  variant?: 'default' | 'v2' | 'v3';
}

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }: SidebarHeaderProps) {
  const pathname = usePathname();

  const trigger = useRef<HTMLButtonElement | null>(null);
  const sidebar = useRef<HTMLDivElement | null>(null);

  const storedSidebarExpanded = typeof window !== 'undefined' ? localStorage.getItem('sidebar-expanded') : null;
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

  // Close on click outside
  useLayoutEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Close if the esc key is pressed
  useLayoutEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Update localStorage and body class for sidebar expansion
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
        const body = document.querySelector('body');
        if (body) {
          if (sidebarExpanded) {
            body.classList.add('sidebar-expanded');
          } else {
            body.classList.remove('sidebar-expanded');
          }
        }
      } catch (e) {
        console.error('Failed to access localStorage:', e);
      }
    }
  }, [sidebarExpanded]);

  // Handle sidebar open/close functionality
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarExpand = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll overflow-x-hidden no-scrollbar lg:overflow-y-auto shrink-0 bg-white dark:bg-gray-900 text-[#6b4f27] dark:text-gray-100 border-r border-[#bfa77a] dark:border-[#232323] shadow-3xl p-1 transition-all duration-200 ease-in-out w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-80'} ${sidebarExpanded ? 'lg:w-56' : 'lg:w-16'} ${variant === 'v2' ? 'border-r border-[#bfa77a] dark:border-gray-900' : 'rounded-r-md shadow-xs'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-4 pr-1 sm:px-0 items-center">
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition-all duration-300 ease-in-out
    ${pathname.includes('/dashboard')
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 shadow-lg text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:shadow-md'
              }`}
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </Link>


        </div>

        {/* Links */}
        <div className="space-y-6">
          <div>
            <ul className="mt-2">
              {/* Dashboard */}
              <li
                className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('/dashboard') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}
              >
                <Link
                  href="/dashboard"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition-all duration-200 ease-in-out hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60 transition-all duration-200 ease-in-out hover:bg-indigo-100 hover:shadow-sm dark:hover:bg-indigo-900/40">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('/dashboard') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                          <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                          } 2xl:opacity-100 sidebar-text`}
                      >
                        Dashboard
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
              <li
                className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('messages') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}
              >
                <Link
                  href="/messages"
                  className={`block text-[#6b4f27] hover:text-amber-700 truncate transition duration-150`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60 transition-all duration-200 ease-in-out hover:bg-indigo-100 hover:shadow-sm dark:hover:bg-indigo-900/40">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('messages') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 2H4C2.897 2 2 2.897 2 4v16l4-4h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 12H5.172L4 16.172V4h16v10z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                          } 2xl:opacity-100 sidebar-text`}
                      >
                        Messages
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
              <li
                className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('reviews') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}
              >
                <Link
                  href="/reviews"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition-all duration-200 ease-in-out hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60 transition-all duration-200 ease-in-out hover:bg-indigo-100 hover:shadow-sm dark:hover:bg-indigo-900/40">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('reviews') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 .587l3.668 7.431L24 9.169l-6 5.832 1.417 8.312L12 18.897l-7.417 4.416L6 15.001 0 9.169l8.332-1.151z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                          } 2xl:opacity-100 sidebar-text`}
                      >
                        Reviews
                      </span>
                    </div>
                  </div>
                </Link>
              </li>

              <li
                className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('payments') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'} ${pathname.includes('payments') &&
                  'from-emerald-500/[0.12] dark:from-emerald-500/[0.24] to-emerald-500/[0.04]'
                  }`}
              >
                <Link
                  href="/payments"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.includes('payments')
                    ? ''
                    : 'hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('payments') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 7H3c-1.1 0-2 .9-2 2v8a2 2 0 002 2h18a2 2 0 002-2V9c0-1.1-.9-2-2-2zm0 10H3v-5h18v5zm0-7H3V9h18v1z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                          } 2xl:opacity-100 sidebar-text`}
                      >
                        Payments
                      </span>
                    </div>
                  </div>
                </Link>
              </li>


              <li className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('/products') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}>
                <Link
                  href="/products"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition-all duration-200 ease-in-out hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('products') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3.5 0C2.119 0 1 1.119 1 2.5v11c0 1.381 1.119 2.5 2.5 2.5h9c1.381 0 2.5-1.119 2.5-2.5v-11c0-1.381-1.119-2.5-2.5-2.5h-9zM7 2h2v2H7V2zM7 5h2v2H7V5zM7 8h2v2H7V8zM7 11h2v2H7v-2zM3 2h1v11H3V2zM10 2h1v11h-1V2zM13 2h1v11h-1V2z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'} 2xl:opacity-100 sidebar-text`}
                      >
                        Products
                      </span>
                    </div>
                  </div>
                </Link>
              </li>


              <li className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('blogs') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}>
                <Link
                  href="/blogs"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition-all duration-200 ease-in-out hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('blogs') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 4h16v2H4zm0 6h10v2H4zm0 6h16v2H4z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'} 2xl:opacity-100 sidebar-text`}
                      >
                        Blogs
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
              <li
                className={`pl-2 pr-2 py-2 rounded-sm mb-1 last:mb-0 transition-all duration-200 ease-in-out ${pathname.includes('users') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 hover:bg-indigo-100 hover:shadow-md dark:bg-slate-800 dark:hover:bg-indigo-900/50'}`}
              >
                <Link
                  href="/users"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition-all duration-200 ease-in-out hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-white/60 dark:bg-slate-800/60">
                        <svg
                          className={`shrink-0 fill-current transition-all duration-200 ease-in-out ${pathname.includes('users') ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-500 dark:text-slate-400 dark:group-hover:text-indigo-400'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </span>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'
                          } 2xl:opacity-100 sidebar-text`}
                      >
                        Users
                      </span>
                    </div>
                  </div>
                </Link>
              </li>


              {/* <li className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 ${pathname.includes('reviews') && 'bg-gradient-to-r from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]'}`}>
                <Link
                  href="/admin/reviews"
                  className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${pathname.includes('reviews') ? '' : 'hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="grow flex items-center">
                      <svg
                        className={`shrink-0 fill-current ${pathname.includes('reviews') ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.845L19.336 24 12 19.897 4.664 24 6 15.268 0 9.423l8.332-1.268z" />
                      </svg>
                      <span
                        className={`text-sm font-medium ml-4 duration-200 ${sidebarExpanded ? 'lg:opacity-100' : 'lg:opacity-0'} 2xl:opacity-100 sidebar-text`}
                      >
                        Reviews
                      </span>
                    </div>
                  </div>
                </Link>
              </li> */}
            </ul>
          </div>
        </div>


        {/* Expand / collapse button */}
        <div className="pt-2 hidden lg:inline-flex 2xl:hidden  justify-end mt-auto">
          <div className="w-10 pl-2 pb-12 pr-2 py-1">
            <button
              className="text-gray-400 cursor-pointer  hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={toggleSidebarExpand}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className={`shrink-0 fill-current text-gray-400 dark:text-gray-500 ${sidebarExpanded ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;