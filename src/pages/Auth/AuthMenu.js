import React from "react"

import { NavMenu, NavMenuItem, NavMenuSeparator, NavItem, withAuth } from '@availabs/avl-components'


export default withAuth(({ title, shadowed = true, user, children }) => {
  // const theme = useTheme();
  return (
    <div className="h-full">
      {!user.authed ? <NavItem to="/auth/login" type='top'>Login</NavItem> :
      <NavMenu control={
            <div className={`px-6 text-sm text-white font-normal tracking-widest inline-flex flex-col content-start h-full pt-2`}>
              <div>{user.email ? user.email : ''}</div>
              <div className='text-xs -my-1 text-left text-gray-400'>{user.groups[0] ? user.groups[0] : ''}</div>
            </div>
        }>
        { user.authLevel < 5 ? null :
        <NavMenuItem to="/meta" className='hover:text-gray-400'>
            Admin Panel
        </NavMenuItem>
        }
        { /* user.authLevel < 5 ? null :
            <NavMenuItem to="/auth/project-management">
            Manage Users
            </NavMenuItem>
        */ }
        {/*<NavMenuItem to="/auth/profile">
          Profile
        </NavMenuItem>*/}
        <NavMenuSeparator />
        <NavMenuItem to="/auth/logout">
          Logout
        </NavMenuItem>
      </NavMenu>
      }
    </div>
  )
})
