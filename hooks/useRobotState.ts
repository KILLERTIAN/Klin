import { useContext } from 'react';
import { RobotContext } from '../contexts/RobotContext';

export const useRobotState = () => {
    const context = useContext(RobotContext);

    if (!context) {
        throw new Error('useRobotState must be used within a RobotProvider');
    }

    return context;
};