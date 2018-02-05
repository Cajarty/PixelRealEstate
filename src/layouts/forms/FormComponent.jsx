import {GFD, GlobalFormData} from '../../functions/GlobalFormData';

class BuyPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
        };
    }



    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    listen() {
        GFD.listen('x', '', (x) => {
            this.state({x});
        })
        GFD.listen('y', '', (y) => {
            this.state({y});
        })
    }

}