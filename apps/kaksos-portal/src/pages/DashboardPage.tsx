/**
 * Kaksos Portal - Dashboard Page
 * Overview and quick access to Kaksos features
 */

import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="p-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome to your Kaksos AI Twin management portal</p>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-2xl">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="w-10 h-10 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Kaksos Dashboard
                    </h2>
                    <p className="text-lg text-amber-600 font-medium mb-4">
                        Coming Soon
                    </p>
                    <p className="text-gray-500 max-w-md">
                        Your AI Twin management dashboard is under construction.
                        Soon you'll be able to manage memories, train your Kaksos,
                        and configure your digital consciousness settings here.
                    </p>
                </div>

                {/* Feature Preview Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Conversations</h3>
                        <p className="text-sm text-gray-500">Chat history with your AI Twin</p>
                        <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Training</h3>
                        <p className="text-sm text-gray-500">Train your Kaksos with examples and feedback</p>
                        <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
                    </div>

                    <Link
                        to="/settings"
                        className="bg-white rounded-xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Settings</h3>
                        <p className="text-sm text-gray-500">Configure personality and behavior settings</p>
                        <span className="inline-block mt-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Available Now</span>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
