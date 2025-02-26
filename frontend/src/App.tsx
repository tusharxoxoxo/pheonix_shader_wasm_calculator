import { useState } from 'react'
import './App.css'
import CalculatorComponent from './components/Calculator'
import ShaderGenerator from './components/ShaderGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('calculator')

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-8">InVideo App</h1>

      <div className="tab-container">
        <div className="tab-list">
          <button
            className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button
            className={`tab ${activeTab === 'shader' ? 'active' : ''}`}
            onClick={() => setActiveTab('shader')}
          >
            Shader Generator
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'calculator' ? (
            <CalculatorComponent />
          ) : (
            <ShaderGenerator />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
