import React, { Component } from 'react'
//import test from '../../assets/icons/test.png'; is coorecrt

class Pullout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabOpen: -2,
        }
    }

    tabSelected(id) {
        this.setState({
            tabOpen: this.state.tabOpen == id ? -1 : id
        });
    }

    render() {
        return (
            <div className={this.props.side + ' pullout ' + (this.state.tabOpen >= 0 ? 'open' : this.state.tabOpen != -2 ? 'close' : 'closed' )}>
                <div className={'tabContainer ' + this.props.side}>
                {this.props.children.map((child, id) => {
                    return (
                        <div 
                            className={this.props.side + ' tab ' + (this.state.tabOpen == id ? 'selected' : 'unselected')}
                            style={{
                                height: 'calc(' + (1 / this.props.children.length) * 100 + '% - ' + (id == 0 ? 0 : 1) + 'px)',
                            }}
                            key={id}
                            onClick={() => this.tabSelected(id)}
                        >
                            <div 
                                className='iconContainer' 
                                style={{
                                    margin: 'auto',
                                }}
                            >
                                <img className='icon' src={child.props.icon}></img>
                                <div className='name'>
                                    {child.props.tabName}
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
                <div className={this.props.side + ' panel'}>
                        {this.props.children[this.state.tabOpen < 0 ? 0 : this.state.tabOpen].props.children}
                </div>
            </div>
        );
    }
}

export default Pullout