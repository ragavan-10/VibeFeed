import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ label, value, change, icon: Icon, prefix = '', suffix = '' }) => {
  const getTrendIcon = () => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      <p className="stat-value">
        {prefix}{value}{suffix}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  );
};

export default StatCard;
