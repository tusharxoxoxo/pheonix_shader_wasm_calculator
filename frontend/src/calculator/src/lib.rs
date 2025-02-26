use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Calculator;

#[wasm_bindgen]
impl Calculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Calculator
    }

    pub fn evaluate(&self, expression: &str) -> Result<f64, JsValue> {
        let tokens = tokenize(expression);
        match evaluate_expression(&tokens) {
            Ok(result) => Ok(result),
            Err(e) => Err(JsValue::from_str(&format!("Error: {}", e)))
        }
    }
}

#[derive(Debug, PartialEq, Clone)]
enum Token {
    Number(f64),
    Plus,
    Minus,
    Multiply,
    Divide,
    LeftParen,
    RightParen,
}

fn tokenize(input: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();
    
    while let Some(&c) = chars.peek() {
        match c {
            '0'..='9' | '.' => {
                let mut number = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_digit(10) || c == '.' {
                        number.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                if let Ok(n) = number.parse::<f64>() {
                    tokens.push(Token::Number(n));
                }
            }
            '+' => { tokens.push(Token::Plus); chars.next(); }
            '-' => { tokens.push(Token::Minus); chars.next(); }
            '*' => { tokens.push(Token::Multiply); chars.next(); }
            '/' => { tokens.push(Token::Divide); chars.next(); }
            '(' => { tokens.push(Token::LeftParen); chars.next(); }
            ')' => { tokens.push(Token::RightParen); chars.next(); }
            ' ' => { chars.next(); }
            _ => { chars.next(); }
        }
    }
    tokens
}

fn evaluate_expression(tokens: &[Token]) -> Result<f64, String> {
    let mut numbers = Vec::new();
    let mut operators = Vec::new();

    for token in tokens {
        match token {
            Token::Number(n) => numbers.push(*n),
            Token::Plus | Token::Minus | Token::Multiply | Token::Divide => {
                while let Some(op) = operators.last() {
                    if precedence(op) >= precedence(token) {
                        apply_operator(&mut numbers, op)?;
                        operators.pop();
                    } else {
                        break;
                    }
                }
                operators.push(token.clone());
            }
            Token::LeftParen => operators.push(token.clone()),
            Token::RightParen => {
                while let Some(op) = operators.last() {
                    if op == &Token::LeftParen {
                        operators.pop();
                        break;
                    }
                    apply_operator(&mut numbers, op)?;
                    operators.pop();
                }
            }
        }
    }

    while let Some(op) = operators.pop() {
        apply_operator(&mut numbers, &op)?;
    }

    numbers.pop().ok_or_else(|| "Invalid expression".to_string())
}

fn precedence(token: &Token) -> i32 {
    match token {
        Token::Plus | Token::Minus => 1,
        Token::Multiply | Token::Divide => 2,
        Token::LeftParen => 0,
        _ => 0,
    }
}

fn apply_operator(numbers: &mut Vec<f64>, op: &Token) -> Result<(), String> {
    if numbers.len() < 2 {
        return Err("Invalid expression".to_string());
    }
    
    let b = numbers.pop().unwrap();
    let a = numbers.pop().unwrap();
    
    let result = match op {
        Token::Plus => a + b,
        Token::Minus => a - b,
        Token::Multiply => a * b,
        Token::Divide => {
            if b == 0.0 {
                return Err("Division by zero".to_string());
            }
            a / b
        }
        _ => return Err("Invalid operator".to_string()),
    };
    
    numbers.push(result);
    Ok(())
}