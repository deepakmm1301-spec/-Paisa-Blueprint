import React, { useState } from "react";
import { Sparkles, Calendar, Plus, Trash2, HelpCircle, GraduationCap, Home, Car, Heart, Palmtree, Compass, AlertCircle } from "lucide-react";
import { Goal } from "../types";

export default function GoalPlanner() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "goal-1",
      name: "Child Higher Education",
      category: "education",
      targetAmount: 2500000,
      yearsLeft: 12,
      expectedReturn: 12,
      inflationRate: 6,
    },
    {
      id: "goal-2",
      name: "House Purchase Downpayment",
      category: "house",
      targetAmount: 3500000,
      yearsLeft: 7,
      expectedReturn: 12,
      inflationRate: 6,
    },
    {
      id: "goal-3",
      name: "New SUV Car Purchase",
      category: "car",
      targetAmount: 1200000,
      yearsLeft: 4,
      expectedReturn: 10,
      inflationRate: 6,
    },
    {
      id: "goal-4",
      name: "Annual Europe Vacation",
      category: "vacation",
      targetAmount: 400000,
      yearsLeft: 2,
      expectedReturn: 8,
      inflationRate: 5,
    }
  ]);

  // Form states for creating custom goal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<Goal["category"]>("other");
  const [newAmount, setNewAmount] = useState<number>(500000);
  const [newYears, setNewYears] = useState<number>(5);
  const [newReturn, setNewReturn] = useState<number>(12);
  const [newInflation, setNewInflation] = useState<number>(6);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGoal: Goal = {
      id: "goal-" + Date.now(),
      name: newName,
      category: newCat,
      targetAmount: newAmount,
      yearsLeft: newYears,
      expectedReturn: newReturn,
      inflationRate: newInflation,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewName("");
    setNewCat("other");
    setShowAddForm(false);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Math for specific Goal
  const calculateGoalSip = (goal: Goal) => {
    // Inflate target amount according to inflation and years left
    const inflatedTarget = Math.round(goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, goal.yearsLeft));
    
    // Monthly annuity calculation
    const rMonthly = (goal.expectedReturn / 100) / 12;
    const nMonths = goal.yearsLeft * 12;
    const compoundFactor = ((Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly) * (1 + rMonthly);
    const monthlySip = Math.round(inflatedTarget / (compoundFactor || 1));

    return {
      inflatedTarget,
      monthlySip,
    };
  };

  const getCategoryIcon = (cat: Goal["category"]) => {
    switch (cat) {
      case "education":
        return <GraduationCap className="w-5 h-5 text-bhagwa-600" />;
      case "house":
        return <Home className="w-5 h-5 text-emerald-600" />;
      case "car":
        return <Car className="w-5 h-5 text-sky-600" />;
      case "marriage":
        return <Heart className="w-5 h-5 text-rose-500" />;
      case "vacation":
        return <Palmtree className="w-5 h-5 text-amber-500" />;
      default:
        return <Compass className="w-5 h-5 text-violet-500" />;
    }
  };

  return (
    <div id="goal-planner-module" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 px-2.5 py-1 rounded-full">Target Based Investing</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2 font-display">Goal Blueprint Planner</h2>
          <p className="text-slate-500 text-sm mt-1">
            Map out life's biggest milestones. Enter targets today, and calculate exact inflation-protected SIP requirements.
          </p>
        </div>
        <button
          id="btn-add-goal"
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-4 md:mt-0 flex items-center gap-1.5 bg-bhagwa-600 hover:bg-bhagwa-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Goal Target
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="mb-8 p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Sparkles className="w-4 h-4 text-bhagwa-600" /> New Life Goal Target Setup
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Goal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Higher Studies, Kid's Marriage"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Category</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as Goal["category"])}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="education">Child Education</option>
                <option value="marriage">Marriage / Weddings</option>
                <option value="house">House Downpayment / Buy</option>
                <option value="car">Car Purchase</option>
                <option value="vacation">Vacation / Travel</option>
                <option value="other">Other Milestones</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Today's Target cost (₹)</label>
              <input
                type="number"
                required
                min="10000"
                value={newAmount}
                onChange={(e) => setNewAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Years to accomplish goal</label>
              <input
                type="number"
                required
                min="1"
                max="40"
                value={newYears}
                onChange={(e) => setNewYears(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expected Return CAGR (%)</label>
              <input
                type="number"
                required
                min="5"
                max="25"
                step="0.5"
                value={newReturn}
                onChange={(e) => setNewReturn(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assumed Cost Inflation (%)</label>
              <input
                type="number"
                required
                min="0"
                max="15"
                step="0.5"
                value={newInflation}
                onChange={(e) => setNewInflation(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
               type="button"
               onClick={() => setShowAddForm(false)}
               className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bhagwa-600 text-white rounded-lg hover:bg-bhagwa-700 transition-colors cursor-pointer"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const { inflatedTarget, monthlySip } = calculateGoalSip(goal);
          return (
            <div
              key={goal.id}
              className="p-5 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-xs transition-all bg-slate-50/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-white border border-slate-100/80 rounded-xl shadow-xs">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-md leading-snug">{goal.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-medium font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>In {goal.yearsLeft} Years (@{goal.inflationRate}% Inflation)</span>
                  </div>
                </div>

                {/* Costs details comparison list */}
                <div className="pt-2 text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Cost:</span>
                    <span className="font-bold text-slate-700">₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between pb-1 text-[11px] leading-relaxed">
                    <span className="text-rose-500/80 font-medium">Inflated Cost Target:</span>
                    <span className="font-bold text-rose-500 font-mono">₹{inflatedTarget.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Plan Required Monthly SIP display */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Monthly SIP</span>
                  <span className="block text-lg font-extrabold text-bhagwa-600 font-mono">₹{monthlySip.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold bg-bhagwa-50 border border-bhagwa-100 px-2 py-1 rounded-md text-right">
                  Yield: {goal.expectedReturn}%
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-sm font-semibold">No active goals found in your current session.</p>
            <p className="text-xs">Click "Add Goal Target" above to draft a custom life plan!</p>
          </div>
        )}
      </div>
    </div>
  );
}
