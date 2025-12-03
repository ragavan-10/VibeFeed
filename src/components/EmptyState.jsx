import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionTo, 
  onAction 
}) => {
  return (
    <div className="glass-card p-12 text-center">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
      )}
      <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && (actionTo || onAction) && (
        actionTo ? (
          <Link to={actionTo} className="btn-primary inline-flex text-primary-foreground">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary text-primary-foreground">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
