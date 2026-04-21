export function BackgroundOrbs() {
  return (
    <div className="space-bg">
      <div 
        className="orb w-[500px] h-[500px] bg-primary/30 -top-[10%] -left-[10%]"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="orb w-[400px] h-[400px] bg-secondary/20 top-[40%] -right-[5%]"
        style={{ animationDelay: '-5s' }}
      />
      <div 
        className="orb w-[600px] h-[600px] bg-rose-500/10 -bottom-[10%] left-[20%]"
        style={{ animationDelay: '-10s' }}
      />
      <div 
        className="orb w-[300px] h-[300px] bg-violet-600/20 top-[10%] left-[60%]"
        style={{ animationDelay: '-15s' }}
      />
    </div>
  );
}