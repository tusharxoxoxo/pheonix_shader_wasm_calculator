import { useEffect, useState } from 'react';
import init, { Calculator } from '../calculator/pkg';

const CalculatorComponent = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculator, setCalculator] = useState<Calculator | null>(null);

  useEffect(() => {
    const initWasm = async () => {
      try {
        await init();
        setCalculator(new Calculator());
      } catch (err) {
        setError('Failed to initialize WASM calculator');
        console.error('WASM initialization error:', err);
      }
    };

    initWasm();
  }, []);

  const handleCalculate = () => {
    if (!calculator || !expression.trim()) {
      return;
    }

    try {
      const calculationResult = calculator.evaluate(expression);
      setResult(calculationResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid expression');
      setResult(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpression(e.target.value);
    if (error) setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          className="input-field"
          placeholder="Enter mathematical expression (e.g., 2+2)"
          value={expression}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          id="calculator-input"
          name="calculator-expression"
        />
        <button
          className="button"
          onClick={handleCalculate}
          disabled={!calculator || !expression.trim()}
        >
          Calculate
        </button>
      </div>

      {error ? (
        <div className="result-container text-red-600">
          <p>{error}</p>
        </div>
      ) : result !== null ? (
        <div className="result-container">
          <p className="text-lg">
            Result: <span className="font-mono">{result}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default CalculatorComponent;