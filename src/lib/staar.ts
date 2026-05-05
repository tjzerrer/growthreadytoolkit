import type { AlgebraTeks, StaarBlueprintCategory, TeksBreakout } from "./types";

export const staarBlueprint = {
  totalQuestions: 50,
  totalPoints: 59,
  onePointQuestions: 41,
  twoPointQuestions: 9,
  readinessPointEmphasis: "approximately 55-70% of base test points",
  supportingPointEmphasis: "approximately 30-45% of base test points",
  categories: [
    { id: "1", name: "Number and Algebraic Methods", readinessStandards: 2, supportingStandards: 11, questions: "9-11", points: "9-14", priority: "Medium-High" },
    { id: "2", name: "Describing and Graphing Linear Functions, Equations and Inequalities", readinessStandards: 3, supportingStandards: 8, questions: "10-12", points: "10-16", priority: "High" },
    { id: "3", name: "Writing and Solving Linear Functions, Equations and Inequalities", readinessStandards: 5, supportingStandards: 7, questions: "12-14", points: "12-18", priority: "Highest" },
    { id: "4", name: "Quadratic Functions and Equations", readinessStandards: 4, supportingStandards: 4, questions: "9-11", points: "9-14", priority: "High" },
    { id: "5", name: "Exponential Functions and Equations", readinessStandards: 2, supportingStandards: 3, questions: "5-7", points: "5-9", priority: "Medium" },
  ] satisfies StaarBlueprintCategory[],
};

export const algebraTeksLibrary: AlgebraTeks[] = [
  { teks_code: "A.2A", teks_description: "Determine the domain and range of a linear function in mathematical problems and represent restrictions.", reporting_category_id: "2", readiness_or_supporting: "Readiness", student_friendly_skill: "Identify input and output limits for linear relationships.", default_zone: "Linear Functions" },
  { teks_code: "A.2B", teks_description: "Write linear equations in two variables in various forms from different representations.", reporting_category_id: "3", readiness_or_supporting: "Readiness", student_friendly_skill: "Write linear equations from tables, graphs, and descriptions.", default_zone: "Linear Equations" },
  { teks_code: "A.2C", teks_description: "Write linear equations in two variables given one point and the slope or two points.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Write a line from slope and point information.", default_zone: "Linear Equations" },
  { teks_code: "A.2D", teks_description: "Write and solve equations involving direct variation.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Model direct variation.", default_zone: "Linear Equations" },
  { teks_code: "A.2E", teks_description: "Write the equation of a line that contains a given point and is parallel to a given line.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Write equations of parallel lines.", default_zone: "Linear Equations" },
  { teks_code: "A.2F", teks_description: "Write the equation of a line that contains a given point and is perpendicular to a given line.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Write equations of perpendicular lines.", default_zone: "Linear Equations" },
  { teks_code: "A.2G", teks_description: "Write an equation of a line that is parallel or perpendicular to another line and passes through a given point.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Use slope relationships to write lines.", default_zone: "Linear Equations" },
  { teks_code: "A.2H", teks_description: "Write linear inequalities in two variables given tables, graphs, and verbal descriptions.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Write linear inequalities.", default_zone: "Inequalities" },
  { teks_code: "A.2I", teks_description: "Write systems of two linear equations given tables, graphs, and verbal descriptions.", reporting_category_id: "3", readiness_or_supporting: "Readiness", student_friendly_skill: "Write systems of equations.", default_zone: "Systems" },
  { teks_code: "A.3A", teks_description: "Determine the slope of a line given a table of values, graph, two points, or equation.", reporting_category_id: "2", readiness_or_supporting: "Readiness", student_friendly_skill: "Find slope from multiple representations.", default_zone: "Slope" },
  { teks_code: "A.3B", teks_description: "Calculate the rate of change of a linear function represented tabularly, graphically, or algebraically.", reporting_category_id: "2", readiness_or_supporting: "Readiness", student_friendly_skill: "Interpret rate of change.", default_zone: "Slope" },
  { teks_code: "A.3C", teks_description: "Graph linear functions on the coordinate plane and identify key features.", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Graph and describe linear functions.", default_zone: "Graphing" },
  { teks_code: "A.3D", teks_description: "Graph the solution set of linear inequalities in two variables.", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Graph linear inequalities.", default_zone: "Inequalities" },
  { teks_code: "A.3E", teks_description: "Determine the effects on the graph of the parent function f(x)=x when f(x) is replaced by af(x), f(x)+d, f(x-c), f(bx).", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Describe linear transformations.", default_zone: "Transformations" },
  { teks_code: "A.3F", teks_description: "Graph systems of two linear equations in two variables on the coordinate plane and determine the solutions.", reporting_category_id: "2", readiness_or_supporting: "Readiness", student_friendly_skill: "Graph systems and find solutions.", default_zone: "Systems" },
  { teks_code: "A.4A", teks_description: "Calculate, using technology, the correlation coefficient between two quantitative variables.", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Interpret correlation and scatterplots.", default_zone: "Data" },
  { teks_code: "A.4B", teks_description: "Compare and contrast association and causation in real-world problems.", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Distinguish association from causation.", default_zone: "Data" },
  { teks_code: "A.4C", teks_description: "Write, with and without technology, linear functions that provide a reasonable fit to data.", reporting_category_id: "2", readiness_or_supporting: "Supporting", student_friendly_skill: "Model data with linear functions.", default_zone: "Data" },
  { teks_code: "A.5A", teks_description: "Solve linear equations in one variable, including equations with coefficients represented by letters.", reporting_category_id: "3", readiness_or_supporting: "Readiness", student_friendly_skill: "Solve linear equations.", default_zone: "Equations" },
  { teks_code: "A.5B", teks_description: "Solve linear inequalities in one variable and represent solutions.", reporting_category_id: "3", readiness_or_supporting: "Supporting", student_friendly_skill: "Solve and graph inequalities.", default_zone: "Inequalities" },
  { teks_code: "A.5C", teks_description: "Solve systems of two linear equations with two variables.", reporting_category_id: "3", readiness_or_supporting: "Readiness", student_friendly_skill: "Solve systems of equations.", default_zone: "Systems" },
  { teks_code: "A.6A", teks_description: "Determine the domain and range of quadratic functions and represent restrictions.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Identify domain and range for quadratics.", default_zone: "Quadratics" },
  { teks_code: "A.6B", teks_description: "Write equations of quadratic functions given the vertex and another point.", reporting_category_id: "4", readiness_or_supporting: "Readiness", student_friendly_skill: "Write quadratic equations from features.", default_zone: "Quadratics" },
  { teks_code: "A.6C", teks_description: "Write quadratic functions when given real solutions and graphs of related equations.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Write quadratics from roots or graphs.", default_zone: "Quadratics" },
  { teks_code: "A.7A", teks_description: "Graph quadratic functions on the coordinate plane and use key attributes.", reporting_category_id: "4", readiness_or_supporting: "Readiness", student_friendly_skill: "Graph and interpret parabolas.", default_zone: "Quadratics" },
  { teks_code: "A.7B", teks_description: "Describe the relationship between the linear factors of quadratic expressions and the zeros of their associated functions.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Connect factors and zeros.", default_zone: "Quadratics" },
  { teks_code: "A.7C", teks_description: "Determine the effects on the graph of the quadratic parent function f(x)=x^2 when transformed.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Describe quadratic transformations.", default_zone: "Quadratics" },
  { teks_code: "A.8A", teks_description: "Solve quadratic equations having real solutions by factoring, square roots, completing the square, and quadratic formula.", reporting_category_id: "4", readiness_or_supporting: "Readiness", student_friendly_skill: "Solve quadratic equations.", default_zone: "Quadratics" },
  { teks_code: "A.8B", teks_description: "Write, using technology, quadratic functions that provide a reasonable fit to data.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Model data with quadratic functions.", default_zone: "Quadratics" },
  { teks_code: "A.8C", teks_description: "Predict and make decisions using quadratic models.", reporting_category_id: "4", readiness_or_supporting: "Supporting", student_friendly_skill: "Use quadratic models to predict.", default_zone: "Quadratics" },
  { teks_code: "A.9A", teks_description: "Determine the domain and range of exponential functions and represent restrictions.", reporting_category_id: "5", readiness_or_supporting: "Supporting", student_friendly_skill: "Identify domain and range for exponential models.", default_zone: "Exponential" },
  { teks_code: "A.9B", teks_description: "Interpret the meaning of the values of an exponential function in terms of a situation.", reporting_category_id: "5", readiness_or_supporting: "Readiness", student_friendly_skill: "Interpret exponential growth and decay.", default_zone: "Exponential" },
  { teks_code: "A.9C", teks_description: "Write exponential functions in the form f(x)=ab^x given tables, graphs, and descriptions.", reporting_category_id: "5", readiness_or_supporting: "Readiness", student_friendly_skill: "Write exponential models.", default_zone: "Exponential" },
  { teks_code: "A.9D", teks_description: "Graph exponential functions that model growth and decay and identify key features.", reporting_category_id: "5", readiness_or_supporting: "Supporting", student_friendly_skill: "Graph exponential growth and decay.", default_zone: "Exponential" },
  { teks_code: "A.10A", teks_description: "Add and subtract polynomials of degree one and degree two.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Combine polynomial expressions.", default_zone: "Expressions" },
  { teks_code: "A.10B", teks_description: "Multiply polynomials of degree one and degree two.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Multiply polynomial expressions.", default_zone: "Expressions" },
  { teks_code: "A.10C", teks_description: "Determine the quotient of a polynomial of degree one and polynomial of degree two when divided by a polynomial of degree one.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Divide polynomial expressions.", default_zone: "Expressions" },
  { teks_code: "A.10D", teks_description: "Rewrite polynomial expressions of degree one and degree two in equivalent forms using the distributive property.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Rewrite polynomial expressions.", default_zone: "Expressions" },
  { teks_code: "A.10E", teks_description: "Factor polynomial expressions of degree one and degree two.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Factor polynomial expressions.", default_zone: "Expressions" },
  { teks_code: "A.10F", teks_description: "Decide if a binomial can be written as the difference of two squares and factor when possible.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Factor difference of squares.", default_zone: "Expressions" },
  { teks_code: "A.11A", teks_description: "Simplify numerical radical expressions involving square roots.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Simplify square roots and radicals.", default_zone: "Radicals" },
  { teks_code: "A.11B", teks_description: "Simplify numeric and algebraic expressions using laws of exponents.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Use exponent rules.", default_zone: "Exponents" },
  { teks_code: "A.12A", teks_description: "Decide whether relations represented verbally, tabularly, graphically, and symbolically define a function.", reporting_category_id: "1", readiness_or_supporting: "Readiness", student_friendly_skill: "Identify functions from representations.", default_zone: "Functions" },
  { teks_code: "A.12B", teks_description: "Evaluate functions, expressed in function notation, given one or more elements in their domains.", reporting_category_id: "1", readiness_or_supporting: "Readiness", student_friendly_skill: "Evaluate function notation.", default_zone: "Functions" },
  { teks_code: "A.12C", teks_description: "Identify terms of arithmetic and geometric sequences when the sequences are given in function form.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Identify sequence terms.", default_zone: "Sequences" },
  { teks_code: "A.12D", teks_description: "Write formulas for arithmetic and geometric sequences given a table, graph, verbal description, or recursive rule.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Write sequence formulas.", default_zone: "Sequences" },
  { teks_code: "A.12E", teks_description: "Solve mathematic and scientific formulas and other literal equations for a specified variable.", reporting_category_id: "1", readiness_or_supporting: "Supporting", student_friendly_skill: "Solve literal equations.", default_zone: "Equations" },
];

export const algebraBreakouts: TeksBreakout[] = algebraTeksLibrary.flatMap((teks) => {
  const base = teks.teks_code.replace(".", "");
  const primarySkill = teks.default_zone.toLowerCase().includes("graph") ? "graph" : teks.default_zone.toLowerCase().includes("equation") ? "solve" : teks.default_zone.toLowerCase().includes("expression") ? "simplify" : "interpret";
  return [
    {
      breakout_id: `${base}-1`,
      teks_code: teks.teks_code,
      breakout_description: `${teks.student_friendly_skill} from a symbolic or equation representation.`,
      teacher_friendly_description: `${teks.teks_code}: ${teks.student_friendly_skill} using equations or symbolic form.`,
      representation_type: "equation",
      skill_type: primarySkill,
    },
    {
      breakout_id: `${base}-2`,
      teks_code: teks.teks_code,
      breakout_description: `${teks.student_friendly_skill} from a table, graph, verbal description, or real-world context.`,
      teacher_friendly_description: `${teks.teks_code}: ${teks.student_friendly_skill} across multiple representations.`,
      representation_type: "multiple representations",
      skill_type: teks.default_zone === "Expressions" ? "simplify" : "interpret",
    },
  ];
});

export function categoryById(id: string) {
  return staarBlueprint.categories.find((category) => category.id === id);
}

export function categoryByName(name: string) {
  return staarBlueprint.categories.find((category) => category.name === name);
}
