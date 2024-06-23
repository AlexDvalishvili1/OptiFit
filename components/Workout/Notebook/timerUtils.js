export const getTimePassed = (startDateStr) => {
    const startDate = new Date(startDateStr);
    const currentDate = new Date();
    const difference = currentDate.getTime() - startDate.getTime();

    const secondsPassed = Math.floor(difference / 1000);
    const minutesPassed = Math.floor(secondsPassed / 60);
    const hoursPassed = Math.floor(minutesPassed / 60);
    const daysPassed = Math.floor(hoursPassed / 24);

    return {
        days: daysPassed,
        hours: hoursPassed % 24,
        minutes: minutesPassed % 60,
        seconds: secondsPassed % 60,
    };
};
