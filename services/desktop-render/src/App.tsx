import { FunctionComponent, useEffect, useState } from 'react';
import { Button, World } from '@white-rabbit/components';

const { ipcRenderer } = window.require('electron');

const App: FunctionComponent = () => {
  const [user, setUser] = useState<string>('null');
  useEffect(() => {
    ipcRenderer.invoke('business-logic').then((result: string) => setUser(result));
  }, []);

  return (
    <>
      <div>
        Chrome Version:
        <span id="chrome-version" />
      </div>
      <div>
        Electron Version:
        <span id="electron-version" />
      </div>
      <div>
        Node Version:
        <span id="node-version" />
      </div>
      <Button />
      <World />
      <pre>{user}</pre>
    </>
  );
};

export default App;
