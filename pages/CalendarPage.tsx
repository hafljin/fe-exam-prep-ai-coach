
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SESSION_COLORS } from '../constants';

const CalendarPage: React.FC = () => {
    const { t, studyHistory, language } = useAppContext();

    const groupedHistory = studyHistory.reduce<Record<string, { morning: boolean, afternoon: boolean }>>((acc, record) => {
        if (!acc[record.date]) {
            acc[record.date] = { morning: false, afternoon: false };
        }
        acc[record.date][record.sessionType] = true;
        return acc;
    }, {});

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthName = today.toLocaleDateString(language, { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="border rounded-md border-gray-200 dark:border-gray-700"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayHistory = groupedHistory[dateStr];
        calendarDays.push(
            <div key={day} className="border border-gray-200 dark:border-gray-700 p-2 text-center rounded-md bg-white dark:bg-gray-800">
                <div className="font-semibold text-gray-700 dark:text-gray-300">{day}</div>
                {dayHistory && (
                    <div className="flex justify-center mt-2 space-x-1">
                        {dayHistory.morning && <div className={`w-2 h-2 rounded-full ${SESSION_COLORS.morning}`}></div>}
                        {dayHistory.afternoon && <div className={`w-2 h-2 rounded-full ${SESSION_COLORS.afternoon}`}></div>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">{t('study_history')}</h2>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{monthName}</h3>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center"><span className={`w-3 h-3 rounded-full ${SESSION_COLORS.morning} mr-2`}></span>{t('morning_session')}</div>
                        <div className="flex items-center"><span className={`w-3 h-3 rounded-full ${SESSION_COLORS.afternoon} mr-2`}></span>{t('afternoon_session')}</div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs text-center font-bold text-gray-500 dark:text-gray-400 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays}
                </div>
            </div>
             <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h3 className="font-semibold mb-2">{t('study_history')}</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {studyHistory.length > 0 ? [...studyHistory].reverse().map((record, index) => (
                         <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                             <div>
                                <span className="font-semibold">{record.date}</span>
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full text-white ${record.sessionType === 'morning' ? SESSION_COLORS.morning : SESSION_COLORS.afternoon}`}>{t(record.sessionType)}</span>
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{t(record.topic)}</span>
                             </div>
                             <span className="font-bold">{record.correctCount}/{record.totalCount}</span>
                         </li>
                    )) : <p className="text-gray-500 dark:text-gray-400">{t('no_history')}</p>}
                </ul>
            </div>
        </div>
    );
};

export default CalendarPage;