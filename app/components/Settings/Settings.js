import React, { Component } from 'react';
import SettingsMain from './SettingsMain';
import SettingsNet from './SettingsNet';
import SettingsDisplay from './SettingsDisplay';
import SettingsDebug from './SettingsDebug';
import SettingsConfig from './SettingsConfig';

import { traduction } from '../../lang/lang';

const lang = traduction();

export default class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = { tab: 0 };
    this.changeTab = this.changeTab.bind(this);
  }

  changeTab(tab) {
    this.setState({ tab });
  }

  renderTab() {
    if (this.state.tab === 0) {
      return <SettingsMain />;
    } else if (this.state.tab === 1) {
      return <SettingsNet />;
    } else if (this.state.tab === 2) {
      return <SettingsDisplay />;
    } else if (this.state.tab === 3) {
      return <SettingsDebug />;
    } else if (this.state.tab === 4) {
      return <SettingsConfig />;
    }
  }

  renderMenu() {
    const menu = [lang.settingsMain, lang.network, lang.settingsDisplay, lang.settingsDebug, "Config"];
    const self = this;
    return (
      <div className="row" style={{ marginLeft: '0px', marginRight: '0px' }}>
        {menu.map((m, index) => {
          let cls = 'col-md-2 settings_tab';
          if (index === self.state.tab) {
            cls = 'col-md-2 settings_tab settings_tab_active';
          }
          return (
            <div key={`settings_tab_${index}`} className={cls} onClick={self.changeTab.bind(self, index)}>
              <p>{m}</p>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="settings">
        {this.renderMenu()}
        {this.renderTab()}
      </div>
    );
  }
}
