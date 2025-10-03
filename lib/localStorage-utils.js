const USER_FORM_DATA_KEY = 'userFormData';

export const saveUserFormData = (formData) => {
  if (typeof window === 'undefined') return;

  const dataToSave = {
    name: formData.name || '',
    year: formData.year || '',
    month: formData.month || '',
    day: formData.day || '',
    hour: formData.hour || 'unknown',
    gender: formData.gender || 'male',
    calendar: formData.calendar || 'solar',
    isLeapMonth: formData.isLeapMonth || false,
    mbti: formData.mbti || '',
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(USER_FORM_DATA_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Failed to save form data to localStorage:', error);
    return false;
  }
};

export const loadUserFormData = () => {
  if (typeof window === 'undefined') return null;

  try {
    const savedData = localStorage.getItem(USER_FORM_DATA_KEY);
    if (!savedData) return null;

    const parsedData = JSON.parse(savedData);

    delete parsedData.updatedAt;

    return parsedData;
  } catch (error) {
    console.error('Failed to load form data from localStorage:', error);
    return null;
  }
};

export const clearUserFormData = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(USER_FORM_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear form data from localStorage:', error);
    return false;
  }
};

export const mergeWithSavedData = (currentData, savedData) => {
  if (!savedData) return currentData;

  return {
    ...currentData,
    name: currentData.name || savedData.name || '',
    year: currentData.year || savedData.year || '',
    month: currentData.month || savedData.month || '',
    day: currentData.day || savedData.day || '',
    hour: currentData.hour !== 'unknown' ? currentData.hour : (savedData.hour || 'unknown'),
    gender: currentData.gender || savedData.gender || 'male',
    calendar: currentData.calendar || savedData.calendar || 'solar',
    isLeapMonth: currentData.isLeapMonth !== undefined ? currentData.isLeapMonth : (savedData.isLeapMonth || false),
    mbti: currentData.mbti || savedData.mbti || '',
  };
};