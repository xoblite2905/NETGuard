// src/components/common/HeadsUpDisplay.js

import Card from './Card';
import SecurityPostureGauge from '../charts/SecurityPostureGauge';
import OSDistributionChart from '../charts/OSDistributionChart';
import AlertsTrendChart from '../charts/AlertsTrendChart';
import RiskSourceChart from '../charts/RiskSourceChart';

const HeadsUpDisplay = () => {
    return (
        // The entire HUD is a single Card, ensuring a consistent glass background.
        <Card className="lg:col-span-12">
            {/* The internal grid precisely arranges the four components. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-full">
                <div className="h-48"><SecurityPostureGauge value={92} /></div>
                <div className="h-48"><AlertsTrendChart /></div>
                <div className="h-48"><RiskSourceChart /></div>
                <div className="h-48"><OSDistributionChart /></div>
            </div>
        </Card>
    );
};

export default HeadsUpDisplay;
