export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;
export const PROPERTIES_WIDTH = 100;
export const PROPERTIES_HEIGHT = 100;
export const PROPERTY_LENGTH = 10;
export const PROPERTY_SIZE = 100;
export const WEI_IN_ETH = 1000000000000000000;

export const VirtualRealEstate = ['0x54b68bb91593ea5141b19a9548909b8aba2e4557', '0xcbfb3d5139e526fbd1afd592a039c421864e01be', '0xbc512650375fc2560addf36a74adb3a0f88cc6b5','0x0b91f37c52c3c71f097409e03bc4171eb7b50615', '0x1fb6ce46917543cad5f61cd995fa26d889716e5b'];
export const PXLProperty = ['0x482127d44529488611fe9f0e6135fbded58bc761', '0x72a192d7d07f876c0edb6fce79798d5b569dde60', '0x4be75a8a3b769fdea12a00a7cc99a039163ba352'];

export const TOS_VERSION = 257; //16 bit decimal of version TOS then Privacy Policy in order: [00000001][00000001]

export const FORM_STATE = {
    IDLE: {
        name: 'IDLE',
        color: 'green',
        message: '',
    }, 
    PENDING: {
        name: 'PENDING',
        color: 'green',
        message: 'Transaction sent...',
    }, 
    COMPLETE: {
        name: 'COMPLETE',
        color: 'green',
        message: 'Transaction complete!',
    },
    FAILED: {
        name: 'FAILED',
        color: 'red',
        message: 'Transaction failed!',
    },
};

export const NETWORK_DEV = -1;
export const NETWORK_MAIN = 1;
export const NETWORK_ROPSTEN = 3;
export const NETWORK_RINKEBY = 4;
export const NETWORK_KOVAN = 42;