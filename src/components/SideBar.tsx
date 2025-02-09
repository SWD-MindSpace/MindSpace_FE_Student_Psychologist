import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import React from 'react'
import { FiChevronDown, FiFileText, FiGrid, FiUsers } from 'react-icons/fi'

export default function SideBar() {
    return (
        <div className='flex h-screen'>
            <div className='w-64 bg-primary-blue text-white fixed h-full left-0 top-0'>
                <div className='flex justify-center items-center py-6 border-b-2'>
                    <h2 className='font-bold text-xl font-bevnpro'>Admin</h2>
                </div>

                <nav className='mt-10'>
                    <ul className='space-y-20'>
                        <li className='flex items-center p-4 hover:bg-secondary-blue cursor-pointer'>
                            <div className="flex items-center text-lg font-bevnpro font-bold">
                                <FiGrid className="w-5 h-5" />
                                <span className="ml-4">Dashboard</span>
                            </div>
                        </li>
                        <Dropdown>
                            <DropdownTrigger>
                                <li className="flex justify-between items-center p-4 hover:bg-secondary-blue cursor-pointer">
                                    <div className="flex items-center text-lg font-bevnpro font-bold">
                                        <FiFileText className="w-5 h-5" />
                                        <span className="ml-4">Manage Articles</span>
                                    </div>
                                    <FiChevronDown className="w-5 h-5" />
                                </li>
                            </DropdownTrigger>
                            <DropdownMenu className="font-noto-sans uppercase">
                                <DropdownItem key="view-resources">View All Articles/Blogs</DropdownItem>
                                <DropdownItem key="create-resources">Create a new Article/Blog</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger>
                                <li className="flex justify-between items-center p-4 hover:bg-secondary-blue cursor-pointer">
                                    <div className="flex items-center text-lg font-bevnpro font-bold">
                                        <FiUsers className="w-5 h-5" />
                                        <span className="ml-4">Manage Accounts</span>
                                    </div>
                                    <FiChevronDown className="w-5 h-5" />
                                </li>
                            </DropdownTrigger>
                            <DropdownMenu className="font-noto-sans uppercase">
                                <DropdownItem key="school-manager-account">School Manager Accounts</DropdownItem>
                                <DropdownItem key="psychologist-account">Psychologists Accounts</DropdownItem>
                                <DropdownItem key="create-account">Create a new account</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
