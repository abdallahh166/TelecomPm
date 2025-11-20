namespace TelecomPM.Infrastructure.Persistence;

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore.ChangeTracking;

internal static class ValueComparerFactory
{
    public static ValueComparer<List<string>> CreateStringListComparer() =>
        new(
            (c1, c2) => (c1 ?? new List<string>()).SequenceEqual(c2 ?? new List<string>()),
            c => (c ?? new List<string>()).Aggregate(0, (current, value) => HashCode.Combine(current, value.GetHashCode())),
            c => (c ?? new List<string>()).ToList());

    public static ValueComparer<List<Guid>> CreateGuidListComparer() =>
        new(
            (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()),
            c => (c ?? new List<Guid>()).Aggregate(0, (current, value) => HashCode.Combine(current, value.GetHashCode())),
            c => (c ?? new List<Guid>()).ToList());
}

