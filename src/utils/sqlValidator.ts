// SQL Syntax Validator and Query Analyzer
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER' | 'UNKNOWN';
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class SQLValidator {
  private static readonly SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT',
    'EXCEPT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
    'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT',
    'CHECK', 'AS', 'DISTINCT', 'ALL', 'EXISTS', 'IN', 'BETWEEN', 'LIKE', 'IS',
    'AND', 'OR', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COUNT', 'SUM', 'AVG',
    'MIN', 'MAX', 'SUBSTRING', 'CONCAT', 'UPPER', 'LOWER', 'TRIM', 'COALESCE'
  ];

  private static readonly COMMON_FUNCTIONS = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'SUBSTRING', 'CONCAT', 'UPPER', 'LOWER',
    'TRIM', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT', 'DATE', 'YEAR', 'MONTH', 'DAY'
  ];

  static validate(sql: string): ValidationResult {
    const trimmedSql = sql.trim();
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!trimmedSql) {
      return {
        isValid: false,
        errors: ['SQL query cannot be empty'],
        warnings: [],
        suggestions: [],
        queryType: 'UNKNOWN',
        estimatedComplexity: 'LOW'
      };
    }

    // Determine query type
    const queryType = this.getQueryType(trimmedSql);

    // Basic syntax validation
    this.validateBasicSyntax(trimmedSql, errors, warnings);

    // Check for common issues
    this.checkCommonIssues(trimmedSql, warnings, suggestions);

    // Estimate complexity
    const estimatedComplexity = this.estimateComplexity(trimmedSql);

    // Add performance suggestions
    this.addPerformanceSuggestions(trimmedSql, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      queryType,
      estimatedComplexity
    };
  }

  private static getQueryType(sql: string): ValidationResult['queryType'] {
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('SELECT')) return 'SELECT';
    if (upperSql.startsWith('INSERT')) return 'INSERT';
    if (upperSql.startsWith('UPDATE')) return 'UPDATE';
    if (upperSql.startsWith('DELETE')) return 'DELETE';
    if (upperSql.startsWith('CREATE')) return 'CREATE';
    if (upperSql.startsWith('DROP')) return 'DROP';
    if (upperSql.startsWith('ALTER')) return 'ALTER';
    
    return 'UNKNOWN';
  }

  private static validateBasicSyntax(sql: string, errors: string[], warnings: string[]): void {
    // Check for balanced parentheses
    let parenCount = 0;
    for (const char of sql) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) {
        errors.push('Unmatched closing parenthesis');
        break;
      }
    }
    if (parenCount > 0) {
      errors.push('Unmatched opening parenthesis');
    }

    // Check for balanced quotes
    const singleQuotes = (sql.match(/'/g) || []).length;
    const doubleQuotes = (sql.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push('Unmatched single quote');
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push('Unmatched double quote');
    }

    // Check if query ends with semicolon (warning, not error)
    if (!sql.trim().endsWith(';')) {
      warnings.push('Query should end with a semicolon (;)');
    }

    // Check for SELECT without FROM (except for certain cases)
    const upperSql = sql.toUpperCase();
    if (upperSql.includes('SELECT') && !upperSql.includes('FROM') && !upperSql.includes('DUAL')) {
      warnings.push('SELECT statement without FROM clause - consider adding FROM clause or using SELECT 1');
    }
  }

  private static checkCommonIssues(sql: string, warnings: string[], suggestions: string[]): void {
    const upperSql = sql.toUpperCase();

    // Check for SELECT *
    if (upperSql.includes('SELECT *')) {
      warnings.push('Using SELECT * can impact performance');
      suggestions.push('Consider specifying only the columns you need');
    }

    // Check for missing WHERE clause in UPDATE/DELETE
    if ((upperSql.includes('UPDATE') || upperSql.includes('DELETE')) && !upperSql.includes('WHERE')) {
      warnings.push('UPDATE/DELETE without WHERE clause affects all rows');
      suggestions.push('Add a WHERE clause to limit the affected rows');
    }

    // Check for potential SQL injection patterns
    if (sql.includes("'") && (sql.includes("' OR ") || sql.includes("' AND "))) {
      warnings.push('Potential SQL injection pattern detected');
      suggestions.push('Use parameterized queries to prevent SQL injection');
    }

    // Check for LIKE without wildcards
    const likeMatches = sql.match(/LIKE\s+['"][^%_]*['"]/gi);
    if (likeMatches) {
      warnings.push('LIKE clause without wildcards (% or _) - consider using = instead');
    }

    // Check for ORDER BY without LIMIT
    if (upperSql.includes('ORDER BY') && !upperSql.includes('LIMIT') && !upperSql.includes('TOP')) {
      suggestions.push('Consider adding LIMIT clause when using ORDER BY for better performance');
    }
  }

  private static estimateComplexity(sql: string): ValidationResult['estimatedComplexity'] {
    const upperSql = sql.toUpperCase();
    let complexityScore = 0;

    // Count complexity indicators
    const joinCount = (upperSql.match(/JOIN/g) || []).length;
    const subqueryCount = (upperSql.match(/\(/g) || []).length;
    const unionCount = (upperSql.match(/UNION/g) || []).length;
    const aggregateCount = (upperSql.match(/(COUNT|SUM|AVG|MIN|MAX|GROUP BY)/g) || []).length;
    const windowFunctionCount = (upperSql.match(/OVER\s*\(/g) || []).length;

    complexityScore += joinCount * 2;
    complexityScore += subqueryCount * 1.5;
    complexityScore += unionCount * 3;
    complexityScore += aggregateCount * 1;
    complexityScore += windowFunctionCount * 4;

    if (complexityScore <= 3) return 'LOW';
    if (complexityScore <= 8) return 'MEDIUM';
    return 'HIGH';
  }

  private static addPerformanceSuggestions(sql: string, suggestions: string[]): void {
    const upperSql = sql.toUpperCase();

    // Suggest indexes for WHERE clauses
    if (upperSql.includes('WHERE')) {
      suggestions.push('Ensure columns in WHERE clause are indexed for better performance');
    }

    // Suggest avoiding functions in WHERE clause
    if (upperSql.match(/WHERE.*\w+\s*\(/)) {
      suggestions.push('Avoid using functions in WHERE clause - consider computed columns or different approach');
    }

    // Suggest LIMIT for large result sets
    if (upperSql.includes('SELECT') && !upperSql.includes('LIMIT') && !upperSql.includes('TOP')) {
      suggestions.push('Consider adding LIMIT clause to prevent large result sets');
    }

    // Suggest EXISTS instead of IN for subqueries
    if (upperSql.includes('IN (SELECT')) {
      suggestions.push('Consider using EXISTS instead of IN with subqueries for better performance');
    }
  }

  static formatSQL(sql: string): string {
    // Basic SQL formatting
    let formatted = sql
      .replace(/\s+/g, ' ')
      .replace(/,/g, ',\n  ')
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT');

    return formatted.trim();
  }

  static getQueryInsights(sql: string): {
    tableCount: number;
    columnCount: number;
    joinCount: number;
    conditionCount: number;
    hasAggregation: boolean;
    hasSubquery: boolean;
  } {
    const upperSql = sql.toUpperCase();
    
    return {
      tableCount: (upperSql.match(/FROM\s+\w+|JOIN\s+\w+/g) || []).length,
      columnCount: (sql.match(/SELECT\s+([^FROM]+)/i)?.[1]?.split(',') || []).length,
      joinCount: (upperSql.match(/JOIN/g) || []).length,
      conditionCount: (upperSql.match(/WHERE|AND|OR/g) || []).length,
      hasAggregation: /COUNT|SUM|AVG|MIN|MAX|GROUP BY/i.test(sql),
      hasSubquery: sql.includes('(') && /SELECT.*FROM/i.test(sql)
    };
  }
}
