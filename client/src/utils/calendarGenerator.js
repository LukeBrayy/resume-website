export const generateCalendarHTML = (dates) => {
    // Ensure dates are handled in local timezone
    const workDates = dates.map(d => {
        const date = new Date(d);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }).sort((a, b) => a - b);
    
    // Get the first and last month/year
    const startDate = workDates[0];
    const endDate = workDates[workDates.length - 1];
    
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    
    let calendarsHTML = '';
    
    while (currentDate <= lastDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        calendarsHTML += `
            <div class="calendar-month">
                <h4>${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <table class="calendar">
                    <tr>
                        <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                    </tr>
        `;
        
        let dayCount = 1;
        let calendarHTML = '';
        
        for (let i = 0; i < 6; i++) {
            let weekHTML = '<tr>';
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCount > daysInMonth) {
                    weekHTML += '<td></td>';
                } else {
                    const currentDay = new Date(year, month, dayCount);
                    const isWorkDay = workDates.some(d => 
                        d.getTime() === currentDay.getTime()
                    );
                    weekHTML += `
                        <td class="${isWorkDay ? 'worked-day' : ''}">${dayCount}</td>
                    `;
                    dayCount++;
                }
            }
            weekHTML += '</tr>';
            calendarHTML += weekHTML;
            if (dayCount > daysInMonth) break;
        }
        
        calendarsHTML += calendarHTML + '</table></div>';
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return `
        <div class="calendars-container">
            ${calendarsHTML}
        </div>
    `;
};