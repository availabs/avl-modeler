import React  from "react"
import {useTheme, TopNav} from '@availabs/avl-components'
import AuthMenu from 'pages/Auth/AuthMenu'

const Layout = ({children}) => {
	const theme = useTheme()
	return (
	  	<div className={`flex items-start flex-col min-h-screen`}>
            <div className='w-full fixed bg-white z-10'>
		  		<TopNav
		  			logo={<div className='text-gray-200 px-4 text-sm font-medium'>HAZARD DATA</div>}
		  			menuItems={[
		    			
		    			{
			                name: 'Home',
			                path: `/`,
			                //icon: 'fa fa-home',
			                className: 'font-medium text-lg'
			                
			            },
		    			{
			                name: 'Methodology',
			                path: `/methods`,
			                //icon: 'fa fa-edit',
			                className: 'font-medium text-lg'
			            },
		    		]}
		    	/>
		    </div>
            <div className={`w-full hasValue flex-1 mt-12 bg-gray-100 flex`}>
	    		{children}
	    	</div>
		</div>
	)
}

export default Layout

//{/*rightMenu={<div className='border-b border-gray-200 pb-3'><AuthMenu /></div>}*/}
		    		