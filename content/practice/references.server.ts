import "server-only";

/** Maintainer verification only. Never passed as page props or served by an endpoint. */
export const referenceSolutions: Record<string, string> = {
  "first-occurrence": `function solve({nums,target}) { let lo=0,hi=nums.length; while(lo<hi){const mid=lo+Math.floor((hi-lo)/2); if(nums[mid]>=target)hi=mid;else lo=mid+1;} return nums[lo]===target?lo:-1; }`,
  "unweighted-distance": `function solve({adj,start,goal}) { const distance=Array(adj.length).fill(-1),queue=[start];distance[start]=0;for(let head=0;head<queue.length;head++){const v=queue[head];if(v===goal)return distance[v];for(const u of adj[v])if(distance[u]===-1){distance[u]=distance[v]+1;queue.push(u);}}return -1; }`,
  "sorted-pair": `function solve({nums,target}) { let left=0,right=nums.length-1;while(left<right){const sum=nums[left]+nums[right];if(sum===target)return true;if(sum<target)left++;else right--;}return false; }`,
  "unique-window": `function solve({s}) { const last=new Map();let left=0,best=0;for(let right=0;right<s.length;right++){const c=s[right];if(last.has(c))left=Math.max(left,last.get(c)+1);last.set(c,right);best=Math.max(best,right-left+1);}return best; }`,
  "range-totals": `function solve({nums,queries}) { const prefix=[0];for(const n of nums)prefix.push(prefix[prefix.length-1]+n);return queries.map(([l,r])=>prefix[r+1]-prefix[l]); }`,
  "budget-knapsack": `function solve({items,capacity}) { const dp=Array(capacity+1).fill(0);for(const [w,v] of items)for(let c=capacity;c>=w;c--)dp[c]=Math.max(dp[c],dp[c-w]+v);return dp[capacity]; }`,
  "regression-audit": `function solve({train,test}) { let mx=0,my=0;for(const [x,y] of train){mx+=x;my+=y;}mx/=train.length;my/=train.length;let numerator=0,denominator=0;for(const [x,y] of train){numerator+=(x-mx)*(y-my);denominator+=(x-mx)**2;}const slope=denominator===0?0:numerator/denominator,intercept=my-slope*mx;let mse=0,mae=0;for(const [x,y]of test){const error=slope*x+intercept-y;mse+=error*error;mae+=Math.abs(error);}return {slope,intercept,mse:mse/test.length,mae:mae/test.length}; }`,
};
