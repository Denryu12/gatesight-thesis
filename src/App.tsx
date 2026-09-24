import { StoreProvider } from './store/StoreContext';
import { DemoLayout } from './components/DemoLayout';

function App() {
  return (
    <StoreProvider>
      <DemoLayout />
    </StoreProvider>
  );
}

export default App;
