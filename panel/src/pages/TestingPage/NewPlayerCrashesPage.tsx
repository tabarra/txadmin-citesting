import DebouncedResizeContainer from "@/components/DebouncedResizeContainer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3Icon, FolderOpenIcon, ShapesIcon, SkullIcon } from "lucide-react";
import { memo, useState } from "react";
import TmpFiller from "./TmpFiller";
import TmpHexHslConverter from "./TmpHexHslConverter";
import { createRandomHslColor } from "@/lib/utils";

type PlayerCrashesChartProps = {
    selectedType: string;
    setSelectedType: (value: string) => void;
    selectedPeriod: string;
    setSelectedPeriod: (value: string) => void;
};

const PlayerCrashesChart = memo(function PlayerCrashesChart({
    selectedType,
    setSelectedType,
    selectedPeriod,
    setSelectedPeriod,
}: PlayerCrashesChartProps) {
    const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
    return (
        <div className="py-2 md:rounded-xl border bg-card shadow-sm flex flex-col fill-primary h-56 max-h-56">
            <div className="px-4 flex flex-row items-center justify-between space-y-0 pb-2 text-muted-foreground">
                <h3 className="tracking-tight text-sm font-medium line-clamp-1">
                    Player Crashes
                </h3>
                <div className="flex gap-4">
                    <Select defaultValue={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-32 grow md:grow-0 h-6 px-3 py-1 text-sm" >
                            <SelectValue placeholder="Filter by admin" />
                        </SelectTrigger>
                        <SelectContent className="px-0">
                            <SelectItem value={'count'} className="cursor-pointer">
                                Crash Count
                            </SelectItem>
                            <SelectItem value={'hour'} className="cursor-pointer">
                                Crash Rate (%)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-32 grow md:grow-0 h-6 px-3 py-1 text-sm" >
                            <SelectValue placeholder="Filter by admin" />
                        </SelectTrigger>
                        <SelectContent className="px-0">
                            <SelectItem value={'day'} className="cursor-pointer">
                                Days
                            </SelectItem>
                            <SelectItem value={'hour'} className="cursor-pointer">
                                Hours
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <div className='hidden xs:block'><BarChart3Icon /></div>
                </div>
            </div>
            <DebouncedResizeContainer onDebouncedResize={setChartSize}>
                <div className="absolute inset-0 flex items-center justify-center bg-fuchsia-950">
                    <div className="text-2xl text-center text-fuchsia-300">
                        {chartSize.width}x{chartSize.height} <br />
                        type: {selectedType} <br />
                        period: {selectedPeriod}
                    </div>
                </div>
            </DebouncedResizeContainer>
        </div>
    );
});


export const dropReasonCategories = {
    'user-initiated': {
        label: 'By user',
        color: '#7CD28F', //nivo
        count: Math.round(Math.random() * 500),
    },
    timeout: {
        label: 'Timeout',
        color: '#E8A838', //nivo
        count: Math.round(Math.random() * 500),
    },
    'server-initiated': {
        label: 'By server',
        color: '#61CDBB', //nivo
        count: Math.round(Math.random() * 500),
    },
    unknown: {
        label: 'Unknown',
        color: '#E8C1A0', //nivo
        count: Math.round(Math.random() * 500),
    },
    security: {
        label: 'Security',
        color: '#F47560', //nivo
        count: Math.round(Math.random() * 500),
    },
    crash: {
        label: 'Crash',
        color: '#F1E15B', //nivo
        count: Math.round(Math.random() * 500),
    },
} as { [key: string]: { label: string, color: string, count: number } };


function DropReasonBar({ label, color, count, totalDrops }: { label: string, color: string, count: number, totalDrops: number }) {
    const percentage = (count / totalDrops) * 100;
    return (
        <div
            key={label}
            className="h-full py-1 text-background text-sm text-center"
            style={{
                width: count / totalDrops * 100 + '%',
                backgroundColor: color
            }}
        >
            {label} <br /> ({percentage.toFixed(1)}%)
        </div>
    );
}


function DiffOld({ children }: { children: React.ReactNode }) {
    return (
        <span className="font-mono px-1 text-sm text-primary dark:text-background bg-destructive-inline">
            {children}
        </span>
    );
}
function DiffNew({ children }: { children: React.ReactNode }) {
    return (
        <span className="font-mono px-1 text-sm text-primary dark:text-background bg-success-inline">
            {children}
        </span>
    );
}

export default function NewPlayerCrashesPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('day');
    const [selectedType, setSelectedType] = useState<string>('count');

    //randomize the drop reason values, must sum to 100%
    const totalDrops = Object.values(dropReasonCategories).reduce((acc, { count }) => acc + count, 0);

    return (
        <div className="space-y-8">
            <PlayerCrashesChart
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
            />



            <div className="pb-2 md:rounded-xl border bg-cardx shadow-sm flex flex-col">
                {/* <div className="flex flex-col flex-shrink px-1 sm:px-4 py-2 space-y-4 border-b rounded-t-xl bg-secondary/35">
                    <div className="flex items-center space-x-2">
                        <div className='hidden xs:block'><FolderOpenIcon className="size-4" /></div>
                        <p className="font-mono text-sm">Overview</p>
                    </div>
                </div>
                <div className="px-4 pt-2 pb-4">
                    Period: {selectedPeriod} <br />
                    Player Drops: 0 <br />
                    Drop Reasons: <br />
                    <div className="w-full bg-secondary foreground rounded-sm flex overflow-clip">
                        {Object.entries(dropReasonCategories).map(([reason, data]) => (
                            <DropReasonBar key={reason} {...data} totalDrops={totalDrops} />
                        ))}
                    </div>
                </div> */}


                <div className="flex flex-col flex-shrink px-1 sm:px-4 py-2 space-y-4 border-b rounded-t-xl bg-secondary/35">
                    <div className="flex items-center space-x-2">
                        <div className='hidden xs:block'><SkullIcon className="size-4" /></div>
                        <p className="font-mono text-sm">Crashes</p>
                    </div>
                </div>
                <div className="px-4 pt-2 pb-4">
                    <TmpFiller count={10} />
                </div>


                <div className="flex flex-col flex-shrink px-1 sm:px-4 py-2 space-y-4 border-t border-b bg-secondary/35">
                    <div className="flex items-center space-x-2">
                        <div className='hidden xs:block'><ShapesIcon className="size-4" /></div>
                        <p className="font-mono text-sm">Changes</p>
                    </div>
                </div>
                <div className="px-4 pt-2 pb-4 space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                            June 14, 2024
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-semibold">Changed FXServer Version</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Switched from <DiffOld>7999</DiffOld> to <DiffNew>8509</DiffNew>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                            June 14, 2024
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-semibold">Changed Game Version</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Switched from <DiffOld>gta5:2060</DiffOld> to <DiffNew>gta5:3095</DiffNew>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">May 22, 2024</div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-semibold">
                                Changed boot resources
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Removed: <DiffOld>xxxx</DiffOld>, <DiffOld>yyyyy</DiffOld>, <DiffOld>zzzzzz</DiffOld>. <br />
                                Added: <DiffNew>aaaaa</DiffNew>, <DiffNew>bbbbb</DiffNew>, <DiffNew>ccccc</DiffNew>.
                            </p>
                        </div>
                    </div>

                </div>




                <div className="flex flex-col flex-shrink px-1 sm:px-4 py-2 space-y-4 border-t border-b bg-secondary/35">
                    <div className="flex items-center space-x-2">
                        <div className='hidden xs:block'><FolderOpenIcon className="size-4" /></div>
                        <p className="font-mono text-sm">Overview</p>
                    </div>
                </div>
                <div className="px-4 py-2 flex flex-wrap justify-evenly gap-4 text-muted-foreground">
                    {Object.values(dropReasonCategories).sort((a, b) => b.count - a.count).map((reason) => (
                        <div
                            key={reason.label}
                            // style={{ backgroundColor: createRandomHslColor() }}
                            className="px-4 flex flex-col gap-2 items-center justify-center"
                        >
                            <span className="text-xl tracking-wider">{reason.label}</span>
                            {reason.count} ({(reason.count / totalDrops * 100).toFixed(1)}%)
                        </div>
                    ))}
                </div>
                {/* <div className="px-4 pt-2 pb-4">
                    dividir a pagina em 5 partes, responsivo, como as stats centro do dashboard em mobile <br />
                    essa página é pra crashes, o resto é fru fru <br />
                    então na real nem precisa daquele progress bar, só um texto mesmo <br />
                    e mover pra baixo
                </div> */}
            </div>



        </div>
    );
}
