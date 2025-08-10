import {
  IconBuildingFill,
  IconChevronsY,
  IconCircleQuestionmarkFill,
  IconDashboardFill,
  IconDotsHorizontal,
  IconHeadphonesFill,
  IconLogout,
  IconMessageFill,
  IconNotesFill,
  IconSettingsFill,
  IconShieldFill,
  IconTicketFill,
  IconTruckFill,
} from '@intentui/icons'
import {
  IconCategoryFilled,
  IconDiscountFilled,
  IconSettingsFilled,
} from '@tabler/icons-react'
import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Logo } from '../logo'
import { Avatar } from '@/components/ui/avatar'
import { Link } from '@/components/ui/link'
import { Menu } from '@/components/ui/menu'
import {
  Sidebar,
  SidebarContent,
  SidebarDisclosure,
  SidebarDisclosureGroup,
  SidebarDisclosurePanel,
  SidebarDisclosureTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarLink,
  SidebarRail,
  SidebarSection,
  SidebarSectionGroup,
  useSidebar,
} from '@/components/ui/sidebar'

export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const pathname = useLocation({
    select: (s) => s.pathname,
  })
  const { setIsOpenOnMobile } = useSidebar()

  // Listen to when pathname changes and close the sidebar
  useEffect(() => {
    setIsOpenOnMobile(false)
  }, [pathname])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link
          className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
          to="/admin/dashboard"
        >
          <Logo className="size-6" />
          <SidebarLabel className="font-bold">
            Shop <span className="text-muted-fg font-normal">Sphere</span>
          </SidebarLabel>
        </Link>
      </SidebarHeader>
      <SidebarContent className="mask-b-from-95% mask-t-from-95%">
        <SidebarSectionGroup>
          <SidebarSection>
            <SidebarLink
              isCurrent={pathname.toLowerCase() === '/admin/dashboard'}
              to="/admin/dashboard"
              tooltip="Overview"
            >
              <IconDashboardFill />
              <SidebarLabel>Overview</SidebarLabel>
            </SidebarLink>

            <SidebarLink
              isCurrent={pathname.startsWith('/admin/products')}
              to="/admin/products"
              tooltip="Products"
            >
              <IconBuildingFill />
              <SidebarLabel>Products</SidebarLabel>
            </SidebarLink>
            <SidebarLink
              isCurrent={pathname.toLowerCase() === '/admin/orders'}
              to="/admin/orders"
              tooltip="Orders"
            >
              <IconTruckFill />
              <SidebarLabel>Orders</SidebarLabel>
            </SidebarLink>
            <SidebarLink
              isCurrent={pathname.toLowerCase() === '/admin/categories'}
              to="/admin/categories"
              tooltip="Categories"
            >
              <IconCategoryFilled data-slot="icon" />
              <SidebarLabel>Categories</SidebarLabel>
            </SidebarLink>
            <SidebarLink
              isCurrent={pathname.toLowerCase() === '/admin/discounts'}
              to="/admin/discounts"
              tooltip="Discounts"
            >
              <IconDiscountFilled data-slot="icon" />
              <SidebarLabel>Discounts</SidebarLabel>
            </SidebarLink>
            <SidebarLink
              isCurrent={pathname.toLowerCase() === '/admin/settings'}
              to="/admin/settings"
              tooltip="Settings"
            >
              <IconSettingsFilled data-slot="icon" />
              <SidebarLabel>Settings</SidebarLabel>
            </SidebarLink>
          </SidebarSection>

          <SidebarDisclosureGroup defaultExpandedKeys={[1]}>
            <SidebarDisclosure id={1}>
              <SidebarDisclosureTrigger>
                <IconDotsHorizontal />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarDisclosureTrigger>
              <SidebarDisclosurePanel>
                <SidebarItem href="#" tooltip="Tickets">
                  <IconTicketFill />
                  <SidebarLabel>Tickets</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Chat Support">
                  <IconMessageFill />
                  <SidebarLabel>Chat Support</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="FAQ">
                  <IconCircleQuestionmarkFill />
                  <SidebarLabel>FAQ</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#" tooltip="Documentation">
                  <IconNotesFill />
                  <SidebarLabel>Documentation</SidebarLabel>
                </SidebarItem>
              </SidebarDisclosurePanel>
            </SidebarDisclosure>
          </SidebarDisclosureGroup>
        </SidebarSectionGroup>
      </SidebarContent>

      <SidebarFooter>
        <Menu>
          <Menu.Trigger className="group" aria-label="Profile">
            <Avatar
              isSquare
              src="https://intentui.com/images/avatar/cobain.jpg"
            />
            <div className="in-data-[sidebar-collapsible=dock]:hidden text-sm">
              <SidebarLabel>Kurt Cobain</SidebarLabel>
              <span className="-mt-0.5 block text-muted-fg">
                kurt@cobain.com
              </span>
            </div>
            <IconChevronsY data-slot="chevron" />
          </Menu.Trigger>
          <Menu.Content
            className="in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)"
            placement="bottom right"
          >
            <Menu.Section>
              <Menu.Header separator>
                <span className="block">Kurt Cobain</span>
                <span className="font-normal text-muted-fg">@cobain</span>
              </Menu.Header>
            </Menu.Section>

            <Menu.Item href="#dashboard">
              <IconDashboardFill />
              Dashboard
            </Menu.Item>
            <Menu.Item href="#settings">
              <IconSettingsFill />
              Settings
            </Menu.Item>
            <Menu.Item href="#security">
              <IconShieldFill />
              Security
            </Menu.Item>
            <Menu.Separator />

            <Menu.Item href="#contact">
              <IconHeadphonesFill />
              Customer Support
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item href="#logout">
              <IconLogout />
              Log out
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
