import type { Metadata } from 'next'
import Header from '@/app/(app)/Header'
import UserProfile from '@/components/UserProfile'

export const metadata: Metadata = {
    title: 'Yore - Dashboard',
}

const DashboardPage = () => {
    return (
        <>
            <Header title="Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <UserProfile />
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default DashboardPage