import Logo from '@/components/ui/logo';
import { useUI } from '@/contexts/ui.context';
import { miniSidebarInitialValue } from '@/utils/constants';
import cn from 'classnames';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useWindowSize } from 'react-use';
import AuthorizedMenu from './authorized-menu';

const Navbar = () => {
  const { toggleSidebar } = useUI();
  const [miniSidebar, setMiniSidebar] = useAtom(miniSidebarInitialValue);
  const { width } = useWindowSize();

  return (
    <header className="fixed top-0 z-40 w-full bg-white shadow">
      <nav className="flex items-center px-5 md:px-8">
        <div className="relative flex w-full flex-1 items-center">
          <div className="flex items-center">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleSidebar}
              className="group flex h-5 w-5 shrink-0 cursor-pointer flex-col justify-center space-y-1 me-4 focus:text-accent focus:outline-none lg:hidden"
            >
              <span
                className={cn(
                  'h-0.5 rounded-full bg-gray-600 transition-[width] group-hover:bg-accent',
                  miniSidebar ? 'w-full' : 'w-2/4',
                )}
              />
              <span className="h-0.5 w-full rounded-full bg-gray-600 group-hover:bg-accent" />
              <span className="h-0.5 w-3/4 rounded-full bg-gray-600 transition-[width] group-hover:bg-accent" />
            </motion.button>
            <div
              className={cn(
                'flex h-16 shrink-0 transition-[width] duration-300 me-4 lg:h-[76px] lg:border-solid lg:border-gray-200/80 lg:me-8 lg:border-e',
                miniSidebar ? 'lg:w-[65px]' : 'lg:w-[257px]',
              )}
            >
              <Logo />
            </div>
            <button
              className="group hidden h-5 w-5 shrink-0 cursor-pointer flex-col justify-center space-y-1 me-6 lg:flex"
              onClick={() => setMiniSidebar(!miniSidebar)}
            >
              <span
                className={cn(
                  'h-0.5 rounded-full bg-gray-600 transition-[width] group-hover:bg-accent',
                  miniSidebar ? 'w-full' : 'w-2/4',
                )}
              />
              <span className="h-0.5 w-full rounded-full bg-gray-600 group-hover:bg-accent" />
              <span
                className={cn(
                  'h-0.5 rounded-full bg-gray-600 transition-[width] group-hover:bg-accent',
                  miniSidebar ? 'w-full' : 'w-3/4',
                )}
              />
            </button>
          </div>
          <div className="relative ml-auto mr-1.5 flex h-9 w-9 shrink-0 cursor-pointer items-center"></div>

          <AuthorizedMenu />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
