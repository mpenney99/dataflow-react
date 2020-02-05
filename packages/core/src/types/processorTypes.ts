
export interface NodeProcessor {
    readonly type: string;

    registerProcessor(portIn: string, portOut: string, processor: NodeProcessor): void;

    subscribe(portName: string, sub: (value: unknown) => void): void;
    
    onStart?(): void;

    onStop?(): void;
}